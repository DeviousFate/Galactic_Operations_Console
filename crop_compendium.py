import pypdf

input_pdf_path = "Planet Compendium.pdf"
output_pdf_path = "Cropped_Planet_Compendium.pdf"

reader = pypdf.PdfReader(input_pdf_path)
writer = pypdf.PdfWriter()

# The planet pages start on page 4 (index 3 in Python)
for i in range(3, len(reader.pages)):
    page = reader.pages[i]

    # Get current dimensions
    upper_right = page.mediabox.upper_right
    lower_left = page.mediabox.lower_left

    width = float(upper_right[0]) - float(lower_left[0])
    height = float(upper_right[1]) - float(lower_left[1])

    # Keep the top 48% by moving the bottom edge up
    new_lower_left_y = float(upper_right[1]) - (height * 0.46)

    # Apply the crop
    page.cropbox.lower_left = (float(lower_left[0]), new_lower_left_y)
    page.cropbox.upper_right = (float(upper_right[0]), float(upper_right[1]))

    writer.add_page(page)

with open(output_pdf_path, "wb") as f:
    writer.write(f)

print("PDF cropped successfully!")
