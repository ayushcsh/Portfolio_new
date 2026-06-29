import { SiLeetcode } from "react-icons/si";
import { defineField } from "sanity";

const leetcodeBadge = {
  name: "leetcodeBadge",
  title: "LeetCode Badges",
  description: "SVG badges earned on LeetCode",
  type: "document",
  icon: SiLeetcode,
  fields: [
    defineField({
      name: "title",
      title: "Badge Title",
      type: "string",
      description: "Enter the badge name shown with the SVG",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "badgeSvg",
      title: "Badge SVG",
      type: "image",
      description: "Upload the LeetCode badge SVG",
      options: {
        accept: "image/svg+xml",
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt",
          type: "string",
          description: "Short description for screen readers",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "about",
      title: "What is this about?",
      type: "text",
      rows: 3,
      description: "Briefly explain what this badge represents",
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "badgeSvg",
      subtitle: "about",
    },
  },
};

export default leetcodeBadge;
