#version 450

#include "../base/common.h"

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
	vec3 depth = texture(albedoMap, in_UV).rgb;
	out_color = vec4(in_UV, 0.0, 1.0);
}