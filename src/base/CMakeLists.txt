file(GLOB BASE_SRC "*.cpp" "*.hpp" "*.h" "../../external/imgui/*.cpp")
file(GLOB BASE_HEADERS "*.hpp" "*.h")

include_directories(${CMAKE_CURRENT_SOURCE_DIR}/../../external/ktx/include)
link_directories(${CMAKE_CURRENT_SOURCE_DIR}/../../external/ktx/lib)

add_library(base STATIC ${BASE_SRC} ${KTX_SOURCES})

target_link_libraries(base ${Vulkan_LIBRARY} ${WINLIBS})
