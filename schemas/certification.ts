import { BiBadgeCheck } from "react-icons/bi";
import { defineField } from "sanity";

const certification = {
  name: "certification",
  title: "Certifications & Badges",
  description: "Certification and badge schema",
  type: "document",
  icon: BiBadgeCheck,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Enter the name of the certification or badge",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (rule) => rule.max(80).required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Add a custom slug for the URL or generate one from the name",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "issuer",
      title: "Issuer",
      type: "string",
      description: "Who issued this certification or badge",
    }),
    defineField({
      name: "issuedDate",
      title: "Issued Date",
      type: "date",
    }),
    defineField({
      name: "credentialUrl",
      title: "Credential URL",
      type: "url",
      description: "Verification URL for this certification or badge",
    }),
    defineField({
      name: "logo",
      title: "Badge / Logo",
      type: "image",
      description: "Upload a small badge or issuer logo",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "coverImage",
      title: "Certificate Image",
      type: "image",
      description: "Upload the certificate or badge image",
      options: {
        hotspot: true,
        metadata: ["lqip"],
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "blockContent",
      description: "Write details about this certification or badge",
    }),
  ],
};

export default certification;
