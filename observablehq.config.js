// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "Dr. Thomas Camminady",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    { name: "CV", path: "/cv" },
    { name: "Projects", path: "/projects" },
    {
      name: "Posts",
      pages: [
        { name: "2024-12-30 - Storytelling with my personal running data", path: "/posts/running-history" },
        { name: "2024-06-30 - EU Elections", path: "/posts/elections" },
        { name: "2023-03-21 - What I think about when I run", path: "/posts/running" },
        { name: "2023-03-05 - Polars vs. Pandas", path: "/posts/polars-pandas" },
        { name: "2023-02-22 - Logitech MX Mechanical Mini for Mac: Issues with M1 Mac", path: "/posts/logitech" },

      ]
    },
    {
      name: "Drafts",
      pages: [
        { name: "Tree", path: "/posts/tree" },

      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: "",
  sidebar: true, // whether to show the sidebar
  toc: true, // whether to show the table of contents
  pager: false, // whether to show previous & next links in the footer
  // output: "docs", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
