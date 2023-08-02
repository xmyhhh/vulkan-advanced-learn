#version 450

#include "../base/common.h"


#define ambient 0.1

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


void main() 
{
	vec3 N = (in_fs.Normal);
	vec3 L = (per_frame_data.u_lights[0].position.xyz - in_fs.WorldPos);
	vec3 V = (per_frame_data.u_CameraPos.xyz - in_fs.WorldPos);

	float distence = length(L);
	float atten = 1.0 / pow(distence, 2.0);

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

		vec4 albedo = texture(albedoMap, in_shadowCoord_n.xy);
		vec3 normal = texture(normalMap, in_shadowCoord_n.xy).xyz;
		vec3 fragPos = texture(positionMap, in_shadowCoord_n.xy).xyz;
		vec3 flux = texture(fluxMap, in_shadowCoord_n.xy).xyz;
		if(in_shadowCoord_n.z < 1.0 && in_shadowCoord_n.z > 0.0){

		}
	}

	out_color = vec4(color.rgb, 1.0);
}