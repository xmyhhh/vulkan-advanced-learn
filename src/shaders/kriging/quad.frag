#version 450

layout (binding = 1) uniform sampler2D samplerColor;

layout (location = 0) in vec2 inUV;

layout (location = 0) out vec4 outFragColor;

layout (binding = 0) uniform UBO 
{
	mat4 projection;
	mat4 view;
	vec4 camPos;
	mat4 lightSpace;
	vec4 lightPos;

} ubo;



void main() 
{
	float depth = texture(samplerColor, inUV).r;
	outFragColor = vec4(vec3(1.0-depth), 1.0);
}