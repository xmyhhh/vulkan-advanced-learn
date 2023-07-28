#version 450
#include "../base/common.h"

layout (location = 0) in vec3 in_pos;
layout (location = 1) in vec3 in_uv;
layout (location = 2) in vec3 in_color;
layout (location = 3) in vec3 in_normal;

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
	gl_Position =  per_frame_data.u_mCameraCurrViewProj * pushConsts.model * vec4(in_pos, 1.0);

	out_ps.UV0 = in_uv.xy;
	out_ps.Color0 = in_color;

}



