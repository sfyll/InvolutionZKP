from dataclasses import dataclass
import json
import os
import random
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
        for row in range(image_data.shape[0] - 1, -1, -1):
            reversed_image.append(image_data[row])
        return np.array(reversed_image)

    def reverse_image_using_numpy(self):
        return np.flip(self.get_matrix(), axis=0)

    def save_image(self, image_data, file_name):
        image = Image.fromarray(image_data, mode="RGBA")
        image.save(file_name)

def random_rgba() -> int:
    return random.randint(0, 255)

def create_matrix(rows, columns):
    return [[random_rgba() for _ in range(columns)] for _ in range(rows)]

def matrix_to_json(matrix, filename):
    data = {
        'rows': len(matrix),
        'columns': len(matrix[0]),
        'pixels': matrix
    }
    with open(filename, 'w') as f:
        json.dump(data, f)


if __name__ == "__main__":
    current_path = os.path.dirname(__file__)
    parent_path = os.path.dirname(current_path)

    with open(parent_path+"/original_image_metadata_milady.json") as f:
        original_metadata = json.load(f)

    image_data = pngHandler(
        rows=original_metadata["rows"],
        columns=original_metadata["columns"],
        pixels=original_metadata["pixels"]
    )

    print(image_data.rows)
    print(image_data.columns)

    loop_reversed = image_data.reverse_image_using_loops()
    numpy_reversed = image_data.reverse_image_using_numpy()

    assert np.array_equal(loop_reversed, numpy_reversed), "The reversed images from both implementations are not equal."

    # matrix = create_matrix(4, 4)

    # matrix_to_json(matrix, parent_path+"/50_50_image_metadata.json")

    # image_data.save_image(loop_reversed, current_path+"/reversed_image.png")