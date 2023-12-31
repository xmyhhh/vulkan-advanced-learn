#version 450

layout (location = 0) in vec3 inWorldPos;
layout (location = 1) in vec3 inNormal;
layout (location = 2) in vec2 inUV;
layout (location = 3) in vec4 inTangent;


layout (binding = 0) uniform UBO 
{
	mat4 projection;
	mat4 model;
	mat4 view;
	vec3 camPos;
} ubo;

layout (binding = 1) uniform UBOShared {
	vec4 lights[4];
	float exposure;
	float gamma;
} uboParams;

layout (binding = 2) uniform samplerCube IrradianceMap;
layout (binding = 3) uniform sampler2D BRDFLUT;
layout (binding = 4) uniform samplerCube prefilteredEnvMap;

layout (binding = 5) uniform sampler2D albedoMap;
layout (binding = 6) uniform sampler2D normalMap;
layout (binding = 7) uniform sampler2D aoMap;
layout (binding = 8) uniform sampler2D metallicMap;
layout (binding = 9) uniform sampler2D roughnessMap;

layout (location = 0) out vec4 outColor;

const float PI = 3.14159265359;

//#define ALBEDO pow(texture(albedoMap, inUV).rgb, vec3(2.2))
//#define ROUGHNESS texture(roughnessMap, inUV).r
//#define METALLIC texture(metallicMap, inUV).r

#define ALBEDO vec3(0.8,0.8,0.8)
#define ROUGHNESS 0.01
#define METALLIC 0.95

vec3 materialcolor()
{
	return ALBEDO;
}

// Normal Distribution function --------------------------------------
float D_GGX(float dotNH, float roughness)
{
	float alpha = roughness * roughness;
	float alpha2 = alpha * alpha;
	float denom = dotNH * dotNH * (alpha2 - 1.0) + 1.0;
	return (alpha2)/(PI * denom * denom); 
}

// Geometric Shadowing function --------------------------------------
float G_SchlicksmithGGX(float dotNL, float dotNV, float roughness)
{
	float r = (roughness + 1.0);
	float k = (r*r) / 8.0;
	float GL = dotNL / (dotNL * (1.0 - k) + k);
	float GV = dotNV / (dotNV * (1.0 - k) + k);
	return GL * GV;
}

// Fresnel function ----------------------------------------------------
vec3 F_Schlick(float cosTheta, float metallic)
{
	vec3 F0 = mix(vec3(0.04), materialcolor(), metallic); // * material.specular
	vec3 F = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0); 
	return F;    
}

vec3 F_SchlickR(float cosTheta, vec3 F0, float roughness)
{
	return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}

// Specular BRDF composition --------------------------------------------

vec3 BRDF(vec3 L, vec3 V, vec3 N, float metallic, float roughness)
{
	// Precalculate vectors and dot products	
	vec3 H = normalize (V + L);
	float dotNV = clamp(dot(N, V), 0.0, 1.0);
	float dotNL = clamp(dot(N, L), 0.0, 1.0);
	float dotLH = clamp(dot(L, H), 0.0, 1.0);
	float dotNH = clamp(dot(N, H), 0.0, 1.0);

	// Light color fixed
	vec3 lightColor = vec3(1.0);

	vec3 color = vec3(0.0);

	if (dotNL > 0.0)
	{
		float rroughness = max(0.05, roughness);
		// D = Normal distribution (Distribution of the microfacets)
		float D = D_GGX(dotNH, roughness); 
		// G = Geometric shadowing term (Microfacets shadowing)
		float G = G_SchlicksmithGGX(dotNL, dotNV, rroughness);
		// F = Fresnel factor (Reflectance depending on angle of incidence)
		vec3 F = F_Schlick(dotNV, metallic);

		vec3 spec = D * F * G / (4.0 * dotNL * dotNV);

		vec3 kD = vec3(1.0) - F;
		kD *= 1.0 - METALLIC;   
	
		color += (kD * materialcolor() / PI + spec) * dotNL * lightColor;
	}

	return color;
}

vec3 getPrefilteredReflection(vec3 R, float roughness)
{
	const float MAX_REFLECTION_LOD = 9.0; // todo: param/const
	float lod = roughness * MAX_REFLECTION_LOD;
	float lodf = floor(lod);
	float lodc = ceil(lod);
	vec3 a = textureLod(prefilteredEnvMap, R, lodf).rgb;
	vec3 b = textureLod(prefilteredEnvMap, R, lodc).rgb;
	return mix(a, b, lod - lodf);
}

// ----------------------------------------------------------------------------
void main()
{		  
	vec3 N = normalize(inNormal);
	vec3 V = normalize(ubo.camPos - inWorldPos);
	vec3 R = reflect(-V, N); 

	vec3 F0 = vec3(0.04); 
	F0 = mix(F0, ALBEDO, METALLIC);

	vec2 brdflut = texture(BRDFLUT, vec2(max(dot(N, V), 0.0), ROUGHNESS)).rg;
	vec3 irradiance = texture(IrradianceMap, N).rgb;
	vec3 reflection = getPrefilteredReflection(R, ROUGHNESS).rgb;

	vec3 Lo = vec3(0.0);

	// Specular contribution: Light
	//for (int i = 0; i < uboParams.lights.length(); i++) {
		//vec3 L = normalize(uboParams.lights[i].xyz - inWorldPos);
		//Lo += BRDF(L, V, N, METALLIC, ROUGHNESS);
	//};

	// Diffuse contribution
	vec3 diffuse = irradiance * materialcolor() ;
	vec3 F = F_SchlickR(max(dot(N, V), 0.0), F0, ROUGHNESS);
	vec3 kD = 1.0 - F;
	kD *= 1.0 - METALLIC;	
	Lo += kD * diffuse;

	// Specular contribution: Sky
	Lo += reflection * (F * brdflut.x + brdflut.y);

	// Combine with ambient
	
	Lo += materialcolor() * 0.02;

    vec3 color = Lo / (Lo + vec3(1.0));

	// Gamma correct
	color = pow(color, vec3(0.4545));

	outColor = vec4(color, 1.0);
}