cmake_minimum_required(VERSION 3.8.0)

set(CMAKE_MODULE_PATH  "${CMAKE_SOURCE_DIR}/cmake")

set(NAME vulkanExamples)

project(${NAME})

include_directories(external)
include_directories(external/glm)
include_directories(external/gli)
include_directories(external/imgui)
include_directories(external/tinygltf)
include_directories(external/ktx/include)
include_directories(external/ktx/other_include)
include_directories(src/base)

find_package(Vulkan)

IF(WIN32)
	IF (NOT Vulkan_FOUND)
		find_library(Vulkan_LIBRARY NAMES vulkan-1 vulkan PATHS ${CMAKE_SOURCE_DIR}/libs/vulkan)
		IF (Vulkan_LIBRARY)
			set(Vulkan_FOUND ON)
			MESSAGE("Using bundled Vulkan library version")
		ENDIF()
	ENDIF()
	set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DVK_USE_PLATFORM_WIN32_KHR")
ENDIF(WIN32)

IF (NOT Vulkan_FOUND)
	message(FATAL_ERROR "Could not find Vulkan library!")
ELSE()
	message(STATUS ${Vulkan_LIBRARY})
ENDIF()



add_definitions(-DVK_EXAMPLE_ASSETS_DIR=\"${CMAKE_SOURCE_DIR}/assets/\")
add_definitions(-DVK_EXAMPLE_SHADERS_DIR=\"${CMAKE_SOURCE_DIR}/src/shaders/\")

# Set preprocessor defines
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -DNOMINMAX -D_USE_MATH_DEFINES")
#set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS}   -D_USE_MATH_DEFINES")

# Clang specific stuff
if (CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wno-switch-enum")
endif()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

file(GLOB SOURCE *.cpp )

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin/")

link_directories(${CMAKE_CURRENT_SOURCE_DIR}/external/ktx/lib) 
add_subdirectory(src/math_exp)
add_subdirectory(src/base)
add_subdirectory(src/examples)