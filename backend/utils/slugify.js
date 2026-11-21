// নাম থেকে SEO-Friendly URL (slug) তৈরি করে। যেমন: "Slim Fit Jeans" -> "slim-fit-jeans"
const slugify = (text = '') =>
  text.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// একই slug আগে থাকলে শেষে -2, -3 যোগ করে
const uniqueSlug = async (Model, name, currentId) => {
  const base = slugify(name) || 'item';
  let slug = base;
  let count = 1;
  while (await Model.exists({ slug, _id: { $ne: currentId } })) {
    count += 1;
    slug = `${base}-${count}`;
  }
  return slug;
};

module.exports = { slugify, uniqueSlug };
