#version 450
#include "../base/common.h"

layout (location = 0) in vec3 inPos;
layout (location = 1) in vec2 inUV;
layout (location = 2) in vec3 inColor;
layout (location = 3) in vec3 inNormal;

layout (set=0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};

layout(push_constant) uniform PushConsts {
	mat4 model;
}pushConsts;

layout (location = 0) out VS2PS out_ps;

void main() 
{
	out_ps.UV0 = inUV;
	out_ps.Color0 = inColor;

}



