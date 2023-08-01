#version 450

#include "../base/common.h"


#define ambient 0.1

layout (location = 0) in vec2 in_UV;

layout (location = 0) out vec4 out_color;

layout (constant_id = 0) const int enablePCF = 0;

layout (set = 0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};
layout (set = 0, binding = 1) uniform sampler2D positionMap;
layout (set = 0, binding = 2) uniform sampler2D normalMap;
layout (set = 0, binding = 3) uniform sampler2D albedoMap;
layout (set = 0, binding = 4) uniform sampler2D fluxMap;
layout (set = 0, binding = 5) uniform sampler2D shadowMap;


void main() 
{
	vec4 albedo = texture(albedoMap, in_UV);
	vec3 normal = texture(normalMap, in_UV).xyz;
	vec3 fragPos = texture(positionMap, in_UV).xyz;


	// Ambient part
	vec3 fragcolor  = albedo.rgb * ambient;

	for(int i = 0; i < 1; i++){
		vec3 L = per_frame_data.u_lights[i].position.xyz - fragPos;
		float distence = length(L);
		float atten = 1.0 / pow(distence, 2.0);
		vec3 V = per_frame_data.u_CameraPos.xyz - fragPos;

		L = normalize(L);
		V = normalize(V);
		vec3 N = normalize(normal);

		// Diffuse part
		float NdotL = max(0.0, dot(N, L));
		vec3 diff = per_frame_data.u_lights[i].color.rgb * albedo.rgb * NdotL ;

		// Specular part
		vec3 R = reflect(-L, N);
		float NdotR = max(0.0, dot(R, V));
		vec3 spec = per_frame_data.u_lights[i].color.rgb * albedo.rgb * pow(NdotR, 16.0);

		fragcolor += diff + spec ;	
	}

	out_color = vec4(fragcolor, 1.0);
}