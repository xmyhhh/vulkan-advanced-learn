#version 450

#include "../base/common.h"


#define ambient 0.1
#define numSamples 400

layout (location = 0) in vec4 in_shadowCoord;
layout (location = 1) in VS2PS in_fs;


layout (location = 0) out vec4 out_color;

layout (set = 0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};

layout (binding = 1) uniform sampler2D positionMap;
layout (binding = 2) uniform sampler2D normalMap;
layout (binding = 3) uniform sampler2D albedoMap;
layout (binding = 4) uniform sampler2D fluxMap;
layout (binding = 5) uniform sampler2D shadowMap;
layout (binding = 6) uniform  angle
{
	vec4 i_angle[25];
};

layout (binding = 7) uniform offset 
{
	vec4 i_offset[50];
};

float dot_max(vec3 a, vec3 b){
	return max(dot(a, b), 0);
}

void main() 
{
	vec3 N = (in_fs.Normal);
	vec3 L = (per_frame_data.u_lights[0].position.xyz - in_fs.WorldPos);
	vec3 V = (per_frame_data.u_CameraPos.xyz - in_fs.WorldPos);

	L = normalize(L);
	V = normalize(V);

	vec3 H = normalize(L + V);

	vec3 color = ambient * in_fs.Color0;
	//Draw DirectLighting
	{
		color += per_frame_data.u_lights[0].color.rgb * in_fs.Color0 * max(0.0, dot(N, L));
		color += per_frame_data.u_lights[0].color.rgb * in_fs.Color0 * pow(max(0.0, dot(N, H)), 16.0);
	}

	//Draw inDirectLighting
	{
		vec4 in_shadowCoord_n = in_shadowCoord /in_shadowCoord.w;
		in_shadowCoord_n.xy = in_shadowCoord_n.xy * 0.5 + 0.5;
		vec3 irradiance = vec3(0.0, 0.0, 0.0);
		int sample_num = 0;
	
		if(in_shadowCoord_n.z < 1.0 && in_shadowCoord_n.z > 0.0){
			 for (int i = 0; i < numSamples; i++){
			    //  fetch offset
				vec2 sample_offset;
				if (i % 2 == 0) sample_offset = i_offset[i/2].xy;
				else sample_offset = i_offset[i/2].zw;


				//  rotate the offset vector
				float rotationAngle;

				if (i % 4 == 0) rotationAngle = i_angle[i/4].x;
				else if (i % 4 == 1) rotationAngle = i_offset[i/4].y;
				else if (i % 4 == 2) rotationAngle = i_offset[i/4].z;
				else rotationAngle = i_offset[i/4].w;

				rotationAngle *= 2.0 * 3.14;
				float sin_theta = sin(rotationAngle);
				float cos_theta = cos(rotationAngle);
				sample_offset = mat2(cos_theta, sin_theta, -sin_theta, cos_theta) * sample_offset;

				vec2 sample_coord = in_shadowCoord_n.xy + sample_offset * 0.5;

				if ((sample_coord.y < 0) || (sample_coord.y > 1) ||
				(sample_coord.x < 0) || (sample_coord.x > 1)) continue;

				vec4 albedo = texture(albedoMap, sample_coord);
				vec3 normal = texture(normalMap, sample_coord).xyz;
				vec3 fragPos = texture(positionMap, sample_coord).xyz;
				vec3 flux = texture(fluxMap, sample_coord).xyz;

				vec3 Xp_to_X = in_fs.WorldPos -  fragPos;
				vec3 X_to_Xp = fragPos - in_fs.WorldPos;

				float distance_Xp_X = length(Xp_to_X);

				float angleAttenuation = dot_max(Xp_to_X, normal) * dot_max(X_to_Xp, in_fs.Normal);
				float w = dot(sample_offset, sample_offset);
				irradiance += flux * w * angleAttenuation / pow(distance_Xp_X, 4) ;
			
				
			 }
		}

			color += irradiance;
	}

	out_color = vec4(color.rgb, 1.0);
}