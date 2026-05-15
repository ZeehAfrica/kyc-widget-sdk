export const sendVerificationCode = async (email: string) => {
  console.log(`Sending code to ${email}...`);
  await new Promise((res) => setTimeout(res, 1000));
  return "123456";
};

export const verifyCode = async (code: string) => {
  await new Promise((res) => setTimeout(res, 1000));
  return code === "123456";
};

export const mockNinApi = async (nin: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { valid: nin.match(/^\d{11}$/) };
};

export const mockBvnApi = async (bvn: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { valid: bvn.match(/^\d{11}$/) };
};

export const mockVerifyApi = async (
  formData: FormData,
  uploadEndpoint?: string
) => {
  console.log(formData, uploadEndpoint);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { valid: true, mrz: { passport_number: "A12345678" } };
};
