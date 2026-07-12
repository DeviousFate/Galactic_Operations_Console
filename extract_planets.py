import fitz  # PyMuPDF
import os
import re

# Point this to the newly cropped PDF
input_pdf_path = "Cropped_Planet_Compendium.pdf"
output_folder = "Planet_Images"

# Create a folder to hold all the extracted images
os.makedirs(output_folder, exist_ok=True)

try:
    doc = fitz.open(input_pdf_path)

    for i in range(len(doc)):
        page = doc[i]

        # 1. Extract text to find the planet's name
        text = page.get_text("text")
        # Split into lines and remove empty ones
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        if not lines:
            planet_name = f"Unknown_Planet_{i}"
        else:
            # The first line of text is the planet's name
            planet_name = lines[0]

            # Handle special cases like Alderaan having "(DESTROYED)" on the next line
            if len(lines) > 1 and lines[1].startswith("("):
                planet_name += f" {lines[1]}"

        # Sanitize the name so Windows/Mac doesn't get mad at illegal filename characters
        safe_name = re.sub(r'[\\/*?:"<>|]', "", planet_name)

        # 2. Render the page to an image (matrix scales it up for 2x resolution)
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat)

        # 3. Save the image into our new folder
        output_file = os.path.join(output_folder, f"{safe_name}.png")
        pix.save(output_file)

        print(f"Saved: {safe_name}.png")

    doc.close()
    print("\nSuccess! All planets have been extracted and named.")

except Exception as e:
    print(f"An error occurred: {e}")
