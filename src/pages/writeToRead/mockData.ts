export const batches = [
  { id: 1, name: "Spring 2024 - Grade 5", created: "1/15/2025", total: 15, active: 14, status: "Active" },
  { id: 2, name: "Spring 2024 - Grade 6", created: "1/15/2025", total: 12, active: 12, status: "Active" },
];

export const studentsList = [
  { id: 1, name: "Emma Johnson", email: "emma.j@schocl.edu", batch: "Spring 2024 - Grade 5", books: 3, certs: 2, status: true },
  { id: 2, name: "Liam Chen", email: "liam.c@school.edu", batch: "Spring 2024 - Grade 5", books: 2, certs: 1, status: true },
];

export const gradeBooks = [
  {
    id: 1,
    title: "The Magical Forest",
    author: "Emma Johnson",
    date: "12/24/2025",
    pages: 24,
    words: 3200,
    status: "Excellent",
    feedback:
      "Outstanding creativity and storytelling! The character development was particularly impressive.",
  },
  {
    id: 2,
    title: "My Pet Dragon",
    author: "Sophia Matinez",
    date: "12/24/2025",
    pages: 16,
    words: 2100,
    status: "Pending Review",
    feedback: null as string | null,
  },
];

export type GradeBookMock = (typeof gradeBooks)[number];

export const printOrders = [
  {
    id: 1,
    title: "The Magical Forest",
    student: "Emma Johnson",
    date: "12/24/2025",
    pages: 24,
    words: 3200,
    status: "Processing",
    cost: 89.99,
    quantity: "10 Copies",
    format: "Paperback",
    isbn: "978-1-234567-89-0",
    address: "123 Main St, Springfield, IL 62701",
  },
  {
    id: 2,
    title: "Adventures in Space",
    student: "Emma Johnson",
    date: "12/24/2025",
    pages: 24,
    words: 3200,
    status: "Pending Payment",
    cost: 44.99,
    quantity: "05 Copies",
    format: "Paperback",
    isbn: "Not Assigned",
    address: "123 Main St, Springfield, IL 62701",
  },
];

export type PrintOrderMock = (typeof printOrders)[number];
