from dataclasses import dataclass
import json
import os
from typing import List

import numpy as np
from PIL import Image

@dataclass(init=True, eq=True, repr=True)
class pngHandler:
    rows: int
    columns: int
    pixels: List[list[int, int, int, int]]

    def get_matrix(self):
        return np.array(self.pixels, dtype=np.uint8).reshape((self.rows, self.columns, 4))

    def reverse_image_using_loops(self):
        image_data = self.get_matrix()
        reversed_image = []
        print(image_data.shape[0])
        print(image_data.shape[1])
        for row in range(image_data.shape[0] - 1, -1, -1):
            reversed_image.append(image_data[row])
        return np.array(reversed_image)

    def reverse_image_using_numpy(self):
        return np.flip(self.get_matrix(), axis=0)

    def save_image(self, image_data, file_name):
        image = Image.fromarray(image_data, mode="RGBA")
        image.save(file_name)


if __name__ == "__main__":
    current_path = os.path.dirname(__file__)
    parent_path = os.path.dirname(current_path)

    with open(parent_path+"/original_image_metadata.json") as f:
        original_metadata = json.load(f)

    image_data = pngHandler(
        rows=original_metadata["rows"],
        columns=original_metadata["columns"],
        pixels=original_metadata["pixels"]
    )

    loop_reversed = image_data.reverse_image_using_loops()
    numpy_reversed = image_data.reverse_image_using_numpy()

    assert np.array_equal(loop_reversed, numpy_reversed), "The reversed images from both implementations are not equal."

    # image_data.save_image(loop_reversed, current_path+"/reversed_image.png")