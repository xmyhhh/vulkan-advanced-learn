#version 450
#extension GL_EXT_shader_texture_lod: enable
#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable
// this makes the structures declared with a scalar layout match the c structures
#extension GL_EXT_scalar_block_layout : enable

#include "../base/common.h"

layout (location = 0) in vec3 in_pos;
layout (location = 1) in vec3 in_uv;
layout (location = 2) in vec3 in_color;
layout (location = 3) in vec3 in_normal;

layout (location = 0) out VS2PS out_ps;

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
	gl_Position =  per_frame_data.u_lights[0].mLightViewProj * pushConsts.model * vec4(in_pos, 1.0);

	out_ps.Normal = transpose(inverse(mat3(pushConsts.model))) * normalize(in_normal);
	out_ps.WorldPos = vec3(pushConsts.model * vec4(in_pos, 1.0));
	out_ps.Color0 = in_color;
	out_ps.UV0 = in_uv.xy;
}