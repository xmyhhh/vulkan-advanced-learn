#version 450

layout (location = 0) in vec3 inPos;

layout (binding = 0) uniform UBO 
{
	mat4 lightSpaceMatrix;
} ubo;


layout(push_constant) uniform PushConsts {
	mat4 model;
}pushConsts;

out gl_PerVertex 
{
    vec4 gl_Position;   
};

 
void main()
{
	gl_Position =  ubo.lightSpaceMatrix * pushConsts.model * vec4(inPos, 1.0);
}