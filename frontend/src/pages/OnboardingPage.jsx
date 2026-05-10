// frontend/src/pages/OnboardingPage.jsx
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completedOnboarding } from "../lib/api";
import { MdLinkedCamera, MdUpload, MdRefresh } from "react-icons/md";
import { LuShuffle, LuShipWheel } from "react-icons/lu";
import { BiLoaderCircle } from "react-icons/bi";
import { FaMapMarker, FaLanguage, FaUserAlt, FaInfoCircle } from "react-icons/fa";
import { LANGUAGES } from "../constants";

const AVATAR_OPTIONS = Array.from({ length: 12 }, (_, i) => 
  `https://avatar.iran.liara.run/public/${i + 1}.png`
);

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [selectedAvatar, setSelectedAvatar] = useState(authUser?.profilePicture || AVATAR_OPTIONS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [formState, setFormState] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    nativeLanguage: authUser?.nativeLanguage || "",
    learningLanguage: authUser?.learningLanguage || "",
    location: authUser?.location || "",
    profilePicture: authUser?.profilePicture || AVATAR_OPTIONS[0],
  });

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completedOnboarding,
    onSuccess: () => {
      toast.success("Profile Onboarded Successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onboardingMutation(formState);
  };

  const handleRandomAvatar = () => {
    const randomIdx = Math.floor(Math.random() * AVATAR_OPTIONS.length);
    const randomAvatar = AVATAR_OPTIONS[randomIdx];
    setFormState({ ...formState, profilePicture: randomAvatar });
    setSelectedAvatar(randomAvatar);
    toast.success("Random avatar generated!");
  };

  const selectAvatar = (avatar) => {
    setFormState({ ...formState, profilePicture: avatar });
    setSelectedAvatar(avatar);
    setShowAvatarPicker(false);
    toast.success("Avatar updated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-4xl bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <LuShipWheel className="size-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-base-content/70 mt-2">Tell us about yourself to find the best language partners</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 overflow-hidden shadow-xl transition-transform hover:scale-105">
                  <img
                    src={formState.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MdLinkedCamera className="size-8 text-white" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={handleRandomAvatar} className="btn btn-outline btn-sm gap-2">
                  <LuShuffle className="size-4" />
                  Random Avatar
                </button>
                <button type="button" onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="btn btn-outline btn-sm gap-2">
                  <MdUpload className="size-4" />
                  Choose Avatar
                </button>
              </div>

              {/* Avatar Picker Modal */}
              {showAvatarPicker && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAvatarPicker(false)}>
                  <div className="modal-box max-w-2xl" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-bold text-lg mb-4">Choose Your Avatar</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2">
                      {AVATAR_OPTIONS.map((avatar, idx) => (
                        <div
                          key={idx}
                          className={`cursor-pointer rounded-full p-1 transition-all ${selectedAvatar === avatar ? 'ring-4 ring-primary' : 'hover:ring-2 ring-base-300'}`}
                          onClick={() => selectAvatar(avatar)}
                        >
                          <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-16 h-16 rounded-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="modal-action">
                      <button className="btn" onClick={() => setShowAvatarPicker(false)}>Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaUserAlt className="size-3 text-primary" />
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaMapMarker className="size-3 text-primary" />
                    Location
                  </span>
                </label>
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="City, Country"
                  required
                />
              </div>

              {/* Native Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaLanguage className="size-3 text-primary" />
                    Native Language
                  </span>
                </label>
                <select
                  value={formState.nativeLanguage}
                  onChange={(e) => setFormState({ ...formState, nativeLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-primary transition-all"
                  required
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`native-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Learning Language */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaLanguage className="size-3 text-secondary" />
                    Learning Language
                  </span>
                </label>
                <select
                  value={formState.learningLanguage}
                  onChange={(e) => setFormState({ ...formState, learningLanguage: e.target.value })}
                  className="select select-bordered w-full focus:select-secondary transition-all"
                  required
                >
                  <option value="">Select language you're learning</option>
                  {LANGUAGES.map((lang) => (
                    <option key={`learning-${lang}`} value={lang.toLowerCase()}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Bio */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <FaInfoCircle className="size-3 text-primary" />
                    Bio
                  </span>
                </label>
                <textarea
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered h-28 focus:textarea-primary transition-all resize-none"
                  placeholder="Tell others about yourself and your language learning goals..."
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button className="btn btn-primary w-full gap-2 group" disabled={isPending} type="submit">
              {!isPending ? (
                <>
                  <LuShipWheel className="size-5 group-hover:rotate-180 transition-transform" />
                  Complete Onboarding
                </>
              ) : (
                <>
                  <BiLoaderCircle className="animate-spin size-5" />
                  Saving Profile...
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;