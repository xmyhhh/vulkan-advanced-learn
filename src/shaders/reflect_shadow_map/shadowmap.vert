#version 450


#include "../base/common.h"

layout (location = 0) in vec3 in_pos;
layout (location = 1) in vec3 in_uv;
layout (location = 2) in vec3 in_color;
layout (location = 3) in vec3 in_normal;

layout (location = 0) out VS2PS out_vs;

layout (set=0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};

layout(push_constant) uniform PushConsts {
	mat4 model;
}pushConsts;

out gl_PerVertex 
{
    vec4 gl_Position;   
};

 
void main()
{
	gl_Position = per_frame_data.u_lights[0].mLightViewProj * pushConsts.model * vec4(in_pos, 1.0);

	out_vs.Normal = transpose(inverse(mat3(pushConsts.model))) * normalize(in_normal);
	out_vs.Normal  = normalize(out_vs.Normal );
	out_vs.WorldPos = vec3(pushConsts.model * vec4(in_pos, 1.0));
	out_vs.Color0 = in_color;
	out_vs.UV0 = in_uv.xy;
}