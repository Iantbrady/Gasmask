import os
import re

html_input = """<img src="html/art/Adidas-template_1.png" />
<img src="html/art/Adidas-template_2.png" /><img
  src="html/art/Adidas-template_3.png"
/><img src="html/art/big-cheese-tees_1.png" /><img
  src="html/art/big-cheese-tees_2.png"
/><img src="html/art/big-cheese-tees_3.png" /><img
  src="html/art/boneyard_merch-1.png"
/><img src="html/art/boneyard_merch-2.png" /><img
  src="html/art/boneyard_merch-3.png"
/><img src="html/art/boneyard_merch-4.png" /><img
  src="html/art/boneyard_merch-5.png"
/><img src="html/art/boneyard_merch-6.png" /><img
  src="html/art/boneyard_merch-7.png"
/><img src="html/art/boneyard_merch-8.png" /><img
  src="html/art/boneyard_merch-9.png"
/><img src="html/art/boneyard_merch-10.png" /><img
  src="html/art/boneyard_merch-11.png"
/><img src="html/art/boneyard_merch-12.png" /><img
  src="html/art/boneyard_merch-13.png"
/><img src="html/art/boneyard_merch-14.png" /><img
  src="html/art/boneyard_merch-15.png"
/><img src="html/art/boneyard_merch-16.png" /><img
  src="html/art/boneyard_merch-17.png"
/><img src="html/art/boneyard_merch-18.png" /><img
  src="art/boneyard_merch-19.png"
/><img src="html/art/boneyard_merch-20.png" /><img
  src="html/art/boneyard-merch-2.png"
/><img src="html/art/boneyard-merch-3.png" /><img
  src="html/art/boneyard-merch.png"
/><img src="html/art/Chris-Connelly_logo.png" /><img
  src="html/art/cobain_1.png"
/><img src="html/art/cobain_2.png" /><img src="html/art/cobain_3.png" /><img
  src="html/art/Complexcon_hertake_menu.png"
/><img src="html/art/Complexcon_Reign-BarMenu.png" /><img
  src="html/art/Complexcon_Robin_Hood_Mock+Moodboard_1.png"
/><img src="html/art/Complexcon_Robin_Hood_Mock+Moodboard_2.png" /><img
  src="html/art/dowco_1.png"
/><img src="html/art/dowco_2.png" /><img src="html/art/faces-1.png" /><img
  src="html/art/faces-2.png"
/><img src="html/art/faces.png" /><img src="html/art/fantasy-world_1.png" /><img
  src="html/art/fantasy-world_2.png"
/><img src="html/art/fantasy-world_3-1.png" /><img
  src="html/art/fantasy-world_3.png"
/><img src="html/art/fantasy-world_4.png" /><img
  src="html/art/fftb-logo.png"
/><img src="html/art/fftb.png" /><img src="html/art/flash_1.png" /><img
  src="html/art/gasmask_tagged-nyc.png"
/><img src="html/art/gasmask-supreme_merch.png" /><img
  src="html/art/happiness-and-self-destruction.png"
/><img src="html/art/helmet_design-1.png" /><img
  src="html/art/horror-flash_ahs-cult_1.png"
/><img src="html/art/horror-flash_amityville-horror.png" /><img
  src="html/art/horror-flash_bound-to-vengeance.png"
/><img src="html/art/horror-flash_f13-1.png" /><img
  src="html/art/horror-flash_f13-2.png"
/><img src="html/art/horror-flash_halloween.png" /><img
  src="html/art/horror-flash_hereditary.png"
/><img src="html/art/horror-flash_hush.png" /><img
  src="html/art/horror-flash_mr-trenchfoot.png"
/><img src="html/art/horror-flash_neon-demon.png" /><img
  src="html/art/horror-flash_raw.png"
/><img src="html/art/horror-flash_slenderman.png" /><img
  src="html/art/horror-flash_stranger-things.png"
/><img src="html/art/horror-flash_terrifier.png" /><img
  src="html/art/horror-flash_the-devils-rejects.png"
/><img src="html/art/horror-flash_the-strain.png" /><img
  src="html/art/horror-flash_the-strangers.png"
/><img src="html/art/horror-flash_the-void.png" /><img
  src="html/art/horror-flash_the-vvitch.png"
/><img src="html/art/horror-flash_thewalkingdead.png" /><img
  src="html/art/horror-flash_tomie.png"
/><img src="html/art/horror-flash_torment.png" /><img
  src="html/art/horror-flash_venom.png"
/><img src="html/art/horror-flash_vhs.png" /><img
  src="html/art/Illustration_glove-art.png"
/><img src="html/art/inkhouse_1.png" /><img
  src="html/art/it-follows_sketch-1.png"
/><img src="html/art/Kinco_Ace-Hardware_Trade-Show_Planogram_2025-08.png" /><img
  src="html/art/Kinco_Banners_1.png"
/><img src="html/art/Kinco_Banners_2.png" /><img
  src="html/art/kinco_photography-editing.png"
/><img src="html/art/kinco_photography-editing_2.png" /><img
  src="html/art/kinco_photography-editing_3.png"
/><img src="html/art/kinco_photography-editing_4.png" /><img
  src="html/art/kinco_photography-editing_5.png"
/><img src="html/art/kinco_photography-editing_6.png" /><img
  src="html/art/kinco_photography-editing_7.png"
/><img src="art/kinco_photography-editing_8.png" /><img
  src="html/art/kinco_photography-editing_9.png"
/><img src="html/art/kinco_photography-editing_10.png" /><img
  src="html/art/kinco_social-post.png"
/><img src="html/art/kinco_social-post_2.png" /><img
  src="html/art/kinco_social-post_3.png"
/><img src="html/art/kinco_social-post_4.png" /><img
  src="html/art/kinco_social-post_5.png"
/><img src="html/art/kinco_social-post_6.png" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-05.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-053.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-054.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-055.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-056.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-057.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-058.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-059.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-0510.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-0511.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-0512.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-0513.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-0514.jpg"
/><img src="html/art/Kinco_Thank-You-D2C_2024-0515.jpg" /><img
  src="html/art/Kinco_Thank-You-D2C_2024-0516.jpg"
/><img src="html/art/kinco-lifestyle-2.png" /><img
  src="html/art/kinco-lifestyle-3.png"
/><img src="html/art/kinco-lifestyle.png" /><img
  src="html/art/Linework.png"
/><img src="html/art/mirrored-worlds.png" /><img
  src="html/art/MTVT_streetwear-designs.png"
/><img src="html/art/muses.png" /><img src="html/art/MYST_logo.png" /><img
  src="html/art/neon-demon_poster_1.png"
/><img src="html/art/neon-demon_poster_2.png" /><img
  src="html/art/neon-demon_poster.png"
/><img src="html/art/netflix_1.png" /><img src="html/art/netflix_2.png" /><img
  src="html/art/netflix-layout-2.png"
/><img src="html/art/netflix-layout-3.png" /><img
  src="html/art/netflix-layout.png"
/><img src="html/art/noods-sticker.png" /><img
  src="html/art/Office-Basics_2026-Events-Calendar.png"
/><img src="html/art/outsource_1.png" /><img
  src="html/art/photography-1.png"
/><img src="html/art/photography-2.png" /><img
  src="html/art/plague-doctor-skull.png"
/><img src="html/art/PPK-HTG-901W-M_Artwork_China.png" /><img
  src="html/art/print-making_1.png"
/><img src="html/art/print-making_2.png" /><img
  src="html/art/print-making_3.png"
/><img src="html/art/print-making_4.png" /><img
  src="html/art/print-making_5.png"
/><img src="html/art/print-making_6.png" /><img
  src="html/art/print-making_7.png"
/><img src="html/art/print-making_8.png" /><img
  src="html/art/print-making_9.png"
/><img src="html/art/process.png" /><img
  src="html/art/Redbull_Kornblatz_drafts-01.jpg"
/><img src="html/art/Redbull_Kornblatz_drafts-02.jpg" /><img
  src="html/art/redbull_north45.png"
/><img src="html/art/redbullxseesee_1.png" /><img
  src="html/art/redbullxseesee_2.png"
/><img src="html/art/redbullxseesee_3.png" /><img
  src="html/art/redbullxseesee_4.png"
/><img src="html/art/redbullxseesee_5.png" /><img
  src="html/art/redbullxseesee-lifestyle-2.png"
/><img src="html/art/redbullxseesee-lifestyle-3.png" /><img
  src="html/art/redbullxseesee-lifestyle.png"
/><img src="html/art/redbullxseesee.mp4" /><img
  src="html/art/regicide_2.png"
/><img src="html/art/regicide.png" /><img src="html/art/roach.png" /><img
  src="html/art/Rosa_logo.png" """

# 1. Regex find all image sources (handles multi-line spacing)
srcs = re.findall(r'src=["\']([^"\']+)["\']', html_input)

# 2. Setup your template structure (doubled up brackets {{ }} are used so .format() doesn't break on CSS/HTML styles)
template = """    <div class="grid-item">
      <div class="image-wrapper">
        <img src="art/{filename}" alt="{alt}" />
                        <meta name="">
      </div>
      <div class="item-meta">
        <span class="location"></span>
        <span class="date"></span>
      </div>
    </div>"""

output_blocks = []

for path in srcs:
    # Extract only the filename (e.g. 'Adidas-template_1.png')
    filename = os.path.basename(path)
    
    # Extract filename root without extension (e.g. 'Adidas-template_1')
    name_without_ext = os.path.splitext(filename)[0]
    
    # Generate clean alt text: Replace hyphens and underscores with spaces
    clean_alt = re.sub(r'[-_]', ' ', name_without_ext)
    
    # Insert variables safely into template block
    filled_template = template.format(filename=filename, alt=clean_alt)
    output_blocks.append(filled_template)

# 3. Join all individual structural item items with line breaks
final_html_output = "\n".join(output_blocks)

# 4. Save directly into a target output file
with open("grid_items.html", "w", encoding="utf-8") as f:
    f.write(final_html_output)

print("Success! Created 'grid_items.html' with filled template nodes.")
