const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateProfileImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file for your profile photo.');
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    throw new Error('Profile image must be 5 MB or smaller.');
  }
}
