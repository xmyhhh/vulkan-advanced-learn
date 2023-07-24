<h1 align='center' >1. Prerequisite</h1>

### 1.1 [SPIR-V规范代码转为可阅读的的SPIR-V代码](https://blog.csdn.net/wcj0626/article/details/122725075)

#### 1.1.1 没有结果
```glsl
length |  opCode  | Param1 | ...    -> OpX Param1 ...
```
#### 1.1.2 有结果，但没有类型
```glsl
length | opcode | Result <id> | Param1 | ...  -> %id = OpX param1 ...
```
#### 1.1.3 有结果，有类型
```glsl
length | opcode | Result Type <tid> | Result <id> | Param1 | ... -> %id = OpX %tid Param1 ...
```


```cmake
#example cmake code for auto complie spv befor build
if (${CMAKE_HOST_SYSTEM_PROCESSOR} STREQUAL "AMD64")
  set(GLSL_VALIDATOR "$ENV{VULKAN_SDK}/Bin/glslangValidator.exe")
else()
  set(GLSL_VALIDATOR "$ENV{VULKAN_SDK}/Bin32/glslangValidator.exe")
endif()

file(GLOB_RECURSE GLSL_SOURCE_FILES
    "shaders/*.frag"
    "shaders/*.vert"
    )

foreach(GLSL ${GLSL_SOURCE_FILES})
  get_filename_component(FILE_NAME ${GLSL} NAME)
  set(SPIRV "${PROJECT_BINARY_DIR}/shaders/${FILE_NAME}.spv")
  add_custom_command(
    OUTPUT ${SPIRV}
    COMMAND ${CMAKE_COMMAND} -E make_directory "${PROJECT_BINARY_DIR}/shaders/"
    COMMAND ${GLSL_VALIDATOR} -V ${GLSL} -o ${SPIRV}
    DEPENDS ${GLSL})
  list(APPEND SPIRV_BINARY_FILES ${SPIRV})
endforeach(GLSL)

add_custom_target(
    Shaders 
    DEPENDS ${SPIRV_BINARY_FILES}
    )

add_dependencies(YourMainTarget Shaders)

add_custom_command(TARGET YourMainTarget POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory "$<TARGET_FILE_DIR:YourMainTarget>/shaders/"
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${PROJECT_BINARY_DIR}/shaders"
        "$<TARGET_FILE_DIR:YourMainTarget>/shaders"
        )

```