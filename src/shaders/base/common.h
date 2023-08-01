
struct VS2PS
{
    vec3 Color0;
    vec2 UV0;
    vec2 UV1;
    vec3 Normal;
    vec3 Tangent;
    vec3 Binormal;
    vec3 WorldPos;
};

struct Light
{
    mat4          mLightViewProj;
    vec4          position;
    vec4          color;

};

struct PerFrame
{
    mat4          u_mCameraCurrProj;
    mat4          u_mCameraCurrView;
    vec4          u_CameraPos;

    Light         u_lights[1];
};



