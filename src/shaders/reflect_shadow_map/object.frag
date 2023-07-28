#version 450
#include "../base/common.h"


layout (location = 0) in VS2PS in_vs;

layout (location = 0) out vec4 outFragColor;

layout (constant_id = 0) const int enablePCF = 0;

layout (set=0, binding = 0) uniform perFrame 
{
	PerFrame per_frame_data;
};
layout (binding = 1) uniform sampler2D positionMap;
layout (binding = 2) uniform sampler2D normalMap;
layout (binding = 3) uniform sampler2D albedoMap;
layout (binding = 4) uniform sampler2D fluxMap;
layout (binding = 5) uniform sampler2D shadowMap;


#define ambient 0.1


void main() 
{	

	outFragColor = vec4(texture(albedoMap, in_vs.UV0).rgb, 1.0);

}
