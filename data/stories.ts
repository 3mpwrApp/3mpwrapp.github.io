export type Story = {
  id: string;
  title: string;
  description: string;
  author?: string;
};

export const stories: Story[] = [
  { id: "story1", title: "Back to Work Journey", description: "My recovery and accommodation process.", author: "A. Patel" },
  { id: "story2", title: "Navigating WSIB", description: "What I wish I knew.", author: "J. Nguyen" },
  { id: "story3", title: "Finding Support", description: "Community that made a difference.", author: "M. Clarke" },
];

