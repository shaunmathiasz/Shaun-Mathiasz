export type Article = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  status: "Unpublished draft";
  publishedAt?: string; // Assign only after publication is verified.
  summary: string;
  body: string;
};
export const articles: Article[] = [
  {
    slug: "a-considered-travel-product",
    title: "What makes a travel product feel considered?",
    category: "Travel product",
    tags: ["Product development", "Guest experience"],
    status: "Unpublished draft",
    summary:
      "An editorial starting point on connecting the itinerary, the traveller and the promise of a destination.",
    body: `A travel product is more than a sequence of places. It is a set of expectations: how a journey feels, how comfortably it flows and whether its promise is clear.

## Start with the experience

An itinerary can look compelling on paper while leaving little room for the traveller to enjoy it. Travel time, transitions and the rhythm of a day deserve as much attention as the headline attractions.

## Bring the details together

Destination research, supplier conversations and commercial analysis each offer a different view. The work is to connect them into a coherent proposition.

## A question for further exploration

How can product teams communicate the character of a journey as clearly as its inclusions?

*Unpublished editorial draft.*`,
  },
  {
    slug: "hospitality-and-commercial-thinking",
    title: "Where hospitality meets commercial thinking",
    category: "Perspective",
    tags: ["Hospitality", "Commerce"],
    status: "Unpublished draft",
    summary:
      "A draft reflection on why guest experience belongs in the product development conversation.",
    body: `Hospitality encourages attention to the individual experience. Commercial thinking asks how a proposition can remain viable. Travel product development brings these perspectives into the same conversation.

## Consider the whole journey

The guest experience begins before arrival. The clarity of a package, the practicality of a connection and the quality of information can all influence expectations.

## Make room for both perspectives

A useful product discussion considers experience and commercial structure together. Neither needs to be reduced to a slogan.

*Unpublished editorial draft.*`,
  },
];
