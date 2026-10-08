import { supabase } from '@/services/supabaseClient';

/**
 * Uploads an image to the 'menu-images' Supabase Storage bucket.
 * @param {File} file - The image file from the input element.
 * @param {string} itemName - The name of the menu item (e.g., 'Iced Americano').
 * @param {string} categoryName - The category of the item (e.g., 'Iced Coffee').
 * @returns {Promise<string|null>} - Returns the public URL of the uploaded image, or null if it fails.
 */
export const uploadMenuImage = async (file, itemName, categoryName) => {
  if (!file || !itemName || !categoryName) return null;

  try {
    // 1. Create a structured file path (e.g., "Iced Coffee/Iced Americano-16928374923.png")
    // We add a short timestamp at the end to ensure the browser doesn't cache an old image if they replace it
    const fileExt = file.name.split('.').pop();
    const safeCategory = categoryName.trim();
    const safeItemName = itemName.trim();
    const fileName = `${safeItemName}-${Date.now()}.${fileExt}`;
    const filePath = `${safeCategory}/${fileName}`;

    // 2. Upload the file to the 'menu-images' bucket
    const { data, error } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error.message);
      throw error;
    }

    // 3. Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
};
