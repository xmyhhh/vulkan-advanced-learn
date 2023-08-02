#version 450

#include "../base/common.h"

layout (location = 0) in VS2PS in_vs;

layout (location = 0) out vec4 out_world_sapce;
layout (location = 1) out vec4 out_normal;
layout (location = 2) out vec4 out_frag_color;
layout (location = 3) out vec4 out_flux;

layout (set=0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};

vec3 GetNormalFromNormalMap(vec2 UV, sampler2D samplerNormalMap, vec3 normal, vec3 tangent) {
	vec3 N = normalize(normal);
	vec3 T = normalize(tangent);
	vec3 B = cross(N, T);
	mat3 TBN = mat3(T, B, N);
	return TBN * normalize(texture(samplerNormalMap, UV).xyz * 2.0 - vec3(1.0));
}


void main()
{

	vec3 flux = in_vs.Color0.rgb * (per_frame_data.u_lights[0].color.rgb);
	
	out_flux = vec4(flux, 1.0);
	out_world_sapce = vec4(in_vs.WorldPos, 1.0);
	out_normal = vec4(in_vs.Normal, 1.0);
	out_frag_color = vec4(in_vs.Color0, 1.0);
}