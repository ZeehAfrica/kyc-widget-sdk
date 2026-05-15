import axios from "axios";

export const uploadToCloudinary = async (
  file: File
): Promise<string | null> => {
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "zeeh000");
    data.append("cloud_name", "dkbu8tftr");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dkbu8tftr/image/upload`,
      data,
      {
        params: {
          quality: "auto:low",
        },
      }
    );

    return response.data.secure_url ?? response.data.url ?? null;
  } catch (error) {
    console.error("Failed to upload to Cloudinary", error);
    return null;
  }
};


