import os

import argparse
from logging import handlers

from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

from tools.file import changeSR_name, get_files_paths, get_file_name, get_son_dir


def get_res_type(res_name_ext):
    if ("hdr" in res_name_ext):
        return "skybox"

    if("basecolor" in res_name_ext):
        return "basecolor"

    if ("roughness" in res_name_ext):
        return "roughness"

    if ("normal" in res_name_ext):
        return "normal"

    if("metallic" in res_name_ext):
        return "metallic"

    return "unknow"

def evaluate_paired_img(res_path, res_name, res_name_ext, output_path):

    basecolor_cmd = 'ktx create --format R8G8B8A8_SRGB --assign-oetf srgb ' + res_path + " " + output_path + res_name + ".ktx2"
    normal_cmd = 'ktx create --format R8G8B8_SRGB --assign-oetf srgb ' + res_path + " " + output_path + res_name + ".ktx2"
    roughness_cmd = 'ktx create --format R8_SRGB --assign-oetf srgb ' + res_path + " " + output_path + res_name + ".ktx2"
    metallic_cmd = 'ktx create --format R8_SRGB --assign-oetf srgb ' + res_path + " " + output_path + res_name + ".ktx2"
    skybox_cmd = CLI_PATH + '/cli.exe create -targetFormat R16G16B16A16_SFLOAT -inputPath ' + res_path + " -outCubeMap " + output_path + res_name + ".ktx2" + " -outLUT " + output_path + res_name + "LUT.png"

    cmd = ''
    match(get_res_type(res_name_ext)):
        case "basecolor":
            cmd = basecolor_cmd
        case "roughness":
            cmd = roughness_cmd
        case "normal":
            cmd = normal_cmd
        case "metallic":
            cmd = metallic_cmd
        case "skybox":
            cmd = skybox_cmd

        case "unknow":
            print("*ERROR: Res " + res_name + " type unkown")
            return

    res = os.popen(cmd)
    output_str = res.read()
    print(output_str)



max_workers = 1
output_path = "C:/Users/xmy/Desktop/vulkan-learn-advanced/assets/textures/ktx2/"
res_folder = "C:/Users/xmy/Desktop/vulkan-learn-advanced/assets/textures/ktx2"
CLI_PATH = "C:/Users/xmy/Desktop/KTXCreate/glTF-IBL-Sampler/out/build/x64-Debug"
executor = ThreadPoolExecutor(max_workers=max_workers)

os.makedirs(os.path.join('../evaluate', output_path), exist_ok=True)

res_paths = get_files_paths(res_folder, extensions=['jpg', 'png', 'hdr'])

# add task to ThreadPool
all_task = []
for res_path in res_paths:
    res_name = get_file_name(res_path, False)
    res_name_ext = get_file_name(res_path, True)
    args = [res_path, res_name, res_name_ext, output_path]
    all_task.append(executor.submit(lambda p: evaluate_paired_img(*p), args))

    for future in as_completed(all_task):
        pass