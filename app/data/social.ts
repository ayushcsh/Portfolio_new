import {
  BiLogoGithub,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
} from "react-icons/bi";
import { SiLeetcode, SiPeerlist, SiPinterest } from "react-icons/si";
import { FaSquareXTwitter } from "react-icons/fa6";

const leetcodeUsername = process.env.NEXT_PUBLIC_LEETCODE_USERNAME ?? "ayushk_764u";

export const socialLinks = [
  {
    id: 1,
    name: "GitHub",
    url: "https://github.com/ayushcsh",
    icon: BiLogoGithub,
    status: "social",
  },
  {
    id: 2,
    name: "X",
    url: "https://x.com/ayushK_764",
    icon: FaSquareXTwitter,
    status: "social",
  },
  {
    id: 3,
    name: "Linkedin",
    url: "https://www.linkedin.com/in/ayush-kumar-a8a1592a4/",
    icon: BiLogoLinkedinSquare,
    status: "social",
  },
  
  
  {
    id: 6,
    name: "Instagram",
    url: "https://instagram.com/ayushcsh",
    icon: BiLogoInstagram,
    status: "social",
  },
  {
    id: 7,
    name: "LeetCode",
    url: `https://leetcode.com/u/${leetcodeUsername}/`,
    icon: SiLeetcode,
    status: "social",
  },
  {
    id: 8,
    name: "Pinterest",
    url: "https://in.pinterest.com/ayushXOX/",
    icon: SiPinterest,
    status: "social",
  },
  {
    id: 9,
    name: "Peerlist",
    url: "https://peerlist.io/ayushkumar_nov",
    icon: SiPeerlist,
    status: "social",
  },
];
