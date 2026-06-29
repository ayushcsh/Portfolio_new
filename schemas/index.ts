import job from "./job";
import profile from "./profile";
import project from "./project";
import certification from "./certification";
import leetcodeBadge from "./leetcodeBadge";
import post from "./post";
import author from "./author";
import heroe from "./heroe";
import { youtube } from "./youtube";
import { table } from "./table";
import blockContent from "./blockContent";
import quiz from "./quiz";

export const schemaTypes = [
  profile,
  job,
  project,
  certification,
  leetcodeBadge,
  post,
  author,
  heroe,

  // Reference types
  blockContent,
  youtube,
  table,
  quiz,
];
