export interface CourseSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  image?: string;
}

export interface CourseData {
  slug: string;
  title: string;
  fullTitle: string;
  shortDescription: string;
  image: string;
  gradient: string;
  eyebrow: string;
  bannerDescription: string;
  sections: CourseSection[];
  ctaTitle: string;
  ctaParagraph: string;
}

export const COURSES: CourseData[] = [
  {
    slug: "funtology",
    title: "Funtology",
    fullTitle: "Funtology Fundamentals",
    shortDescription: "DIY Crafts, basics of hair, makeup and skincare.",
    image: "lms-2.png",
    gradient:
      "linear-gradient(135deg, #e91e8c 0%, #c2185b 50%, #ad1457 100%)",
    eyebrow: "CAREER EXPLORATION",
    bannerDescription:
      "A hands-on career exploration program introducing youth to cosmetology, creativity, personal care, professionalism, and entrepreneurship.",
    sections: [
      {
        title: "Who We Are",
        image: "funtology-1.jpeg",
        paragraphs: [
          "Funtology Fundamentals is a hands-on career exploration program designed to introduce youth to the exciting world of cosmetology, creativity, personal care, professionalism, and entrepreneurship. This program gives students more than a fun activity; it gives them a meaningful introduction to real career skills they can understand, practice, and build upon. Through guided lessons, hands-on activities, career vocabulary, product knowledge, sanitation awareness, and confidence-building experiences, students learn how creativity can connect to purpose, career readiness, and future income opportunities.",
          "Funtology was created to help students discover that learning can be exciting, practical, and connected to real life. Many youth are naturally interested in beauty, grooming, hair care, products, styling, and self-expression. Funtology turns that natural interest into an educational experience that supports literacy, communication, problem-solving, teamwork, discipline, and leadership.",
        ],
      },
      {
        title: "What We Offer",
        image: "funtology-2.jpeg",
        paragraphs: [
          "Funtology Fundamentals includes web-based learning curriculum, hands-on practice activities, career exploration lessons, teacher support, and student-friendly instruction. Students are introduced to cosmetology-related tools, product knowledge, hair care basics, sanitation practices, customer service, professional behavior, and creative presentation skills.",
          "Organizations may use Funtology during afterschool programs, before-school programs, in-school enrichment, camps, youth development programs, career days, workforce readiness initiatives, and special programming. Each participating site can use the curriculum to engage students in structured learning while allowing them to explore a fun and creative career pathway.",
          "Funtology kits may include student learning tools and practice materials that allow youth to safely explore the basics of cosmetology in an age-appropriate and educational way. The program is not designed to replace licensed professional training; it is designed to spark interest, build confidence, and expose students to career possibilities early.",
        ],
      },
      {
        title: "Who This Program Serves",
        image: "funtology-3.jpeg",
        paragraphs: [
          "Funtology is ideal for elementary, middle, and high school students, especially grades 3–12. It is a strong fit for schools, afterschool providers, Boys & Girls Clubs, YMCA programs, community centers, summer camps, homeschool groups, youth organizations, workforce programs, career exploration initiatives, and organizations serving students who benefit from hands-on learning.",
          "This program is especially helpful for students who enjoy creativity, beauty, hair care, entrepreneurship, customer service, and project-based learning. It also supports students who may not always connect with traditional classroom learning but thrive when lessons are active, visual, and practical.",
        ],
      },
      {
        title: "How Funtology Benefits Youth",
        image: "funtology-4.jpeg",
        paragraphs: [
          "Funtology helps students build confidence, responsibility, communication skills, creativity, patience, and professionalism. Students learn how to follow instructions, organize tools, complete tasks, work with others, and present themselves with pride. These are valuable skills that can benefit them in school, at home, in future jobs, and in entrepreneurship.",
          "The program also supports literacy and academic development by introducing career vocabulary, written reflections, reading assignments, step-by-step procedures, and real-world problem-solving. Students are not only learning about cosmetology; they are practicing how to think, speak, write, and work like future professionals.",
        ],
      },
      {
        title: "Why Organizations Should Participate",
        image: "funtology-5.jpeg",
        paragraphs: [
          "Organizations should take part in Funtology because it brings excitement, structure, and career exposure into youth programming. It gives students a reason to show up, participate, and stay engaged. Funtology can help strengthen afterschool, before-school, and in-school enrichment by offering a program that feels fun to students while supporting meaningful learning outcomes.",
          "Funtology is also a strong program for organizations looking to offer workforce readiness, entrepreneurship exposure, social-emotional learning, and career-connected education. It helps students see that their interests can connect to real opportunities.",
        ],
      },
    ],
    ctaTitle: "Call to Action",
    ctaParagraph:
      "When your organization is ready to learn more about Funtology Fundamentals, reach out through the iFuntology ERP. A team member or Affiliate can help you review program options, kit quantities, curriculum access, training, and the best fit for your students.",
  },
  {
    slug: "barbertology",
    title: "Barbertology",
    fullTitle: "Barbertology Fundamentals",
    shortDescription: "Master the art of haircutting, styling and barbering.",
    image: "lms-5.png",
    gradient:
      "linear-gradient(135deg, #d4a574 0%, #b8860b 50%, #8b6914 100%)",
    eyebrow: "CAREER EXPLORATION",
    bannerDescription:
      "A youth career exploration program introducing students to barbering, grooming, personal presentation, customer service, and entrepreneurship.",
    sections: [
      {
        title: "Who We Are",
        image: "barbertology-1.jpeg",
        paragraphs: [
          "Barbertology Fundamentals is a youth career exploration program that introduces students to the world of barbering, grooming, personal presentation, customer service, and entrepreneurship. This program helps youth understand that barbering is more than cutting hair; it is a respected career pathway that includes discipline, skill, creativity, communication, sanitation, business ownership, and community impact.",
          "Barbertology was created to give students early exposure to barbering in a safe, educational, and age-appropriate format. Students learn foundational concepts connected to grooming, professional appearance, barber tools, station setup, sanitation, client care, career vocabulary, and business readiness. The program gives youth the opportunity to explore a career field many already recognize from their families, communities, and personal experiences.",
        ],
      },
      {
        title: "What We Offer",
        image: "barbertology-2.jpeg",
        paragraphs: [
          "Barbertology Fundamentals includes web-based curriculum, hands-on learning activities, career vocabulary, practice-based lessons, and teacher support. Students may explore topics such as barbering history, grooming standards, tool identification, sanitation, customer service, professionalism, facial hair awareness, clipper knowledge, consultation basics, and entrepreneurship.",
          "This program is designed for organizations that want to offer students something engaging, practical, and connected to real career interests. Barbertology can be used in afterschool programs, before-school programs, during-school enrichment, summer camps, youth leadership programs, career exploration labs, and workforce readiness initiatives.",
          "Students do not perform licensed barbering services. Instead, they learn introductory skills, safe practices, professional habits, and career awareness through guided instruction and practice tools.",
        ],
      },
      {
        title: "Who This Program Serves",
        image: "barbertology-3.jpeg",
        paragraphs: [
          "Barbertology is ideal for students in grades 3–12 and works well for schools, afterschool providers, youth centers, mentoring programs, community organizations, homeschool groups, camps, and workforce development programs.",
          "This program is especially powerful for students interested in barbering, grooming, style, entrepreneurship, sports culture, personal image, and community-based careers. It can also be a great fit for students who enjoy hands-on activities and may need a practical connection between learning and future opportunities.",
        ],
      },
      {
        title: "How Barbertology Benefits Youth",
        image: "barbertology-4.jpeg",
        paragraphs: [
          "Barbertology helps youth develop discipline, patience, professionalism, communication, focus, respect, and pride in presentation. Students learn that successful barbers must be organized, dependable, clean, respectful, and skilled. These lessons help students build habits that support future success in any career.",
          "The program also encourages entrepreneurship. Students begin to understand how barbers can become licensed professionals, business owners, product sellers, community leaders, and mentors. This helps youth see a career pathway that can lead to financial independence, creativity, and service.",
        ],
      },
      {
        title: "Why Organizations Should Participate",
        image: "barbertology-5.jpeg",
        paragraphs: [
          "Organizations should offer Barbertology because it connects with students in a way that feels real, relatable, and exciting. Barbering is a career many students see in their communities, but they may not understand the professionalism, training, safety, and business knowledge behind it.",
          "Barbertology gives organizations a unique way to introduce workforce readiness, grooming confidence, positive identity, customer service, and career exploration. It can increase student engagement while helping youth think bigger about their talents and future.",
        ],
      },
    ],
    ctaTitle: "Call to Action",
    ctaParagraph:
      "When your organization is ready to learn more about Barbertology Fundamentals, connect through the iFuntology ERP. An Affiliate or team member can help explain curriculum access, kit options, training support, and how the program can fit your youth schedule.",
  },
  {
    slug: "nailtology",
    title: "Nailtology",
    fullTitle: "Nailtology Fundamentals",
    shortDescription: "Creative nail art, design and nail care.",
    image: "lms-3.png",
    gradient:
      "linear-gradient(135deg, #00bcd4 0%, #0097a7 50%, #00838f 100%)",
    eyebrow: "CAREER EXPLORATION",
    bannerDescription:
      "A hands-on career exploration program introducing youth to nail care, creativity, sanitation, customer service, and entrepreneurship.",
    sections: [
      {
        title: "Who We Are",
        image: "nailtology-1.jpeg",
        paragraphs: [
          "Nailtology Fundamentals is a hands-on career exploration program that introduces youth to nail care, creativity, sanitation, customer service, product knowledge, design basics, professionalism, and entrepreneurship. This program gives students the opportunity to explore the nail industry in a safe, educational, and age-appropriate way while developing skills that support confidence, patience, focus, and career awareness.",
          "Nailtology was created for students who enjoy creativity, detail, color, beauty, design, and self-expression. It transforms that interest into structured learning that helps students understand the professional side of nail care. Students learn that the nail industry is not just about polish; it involves safety, sanitation, client care, business skills, communication, and artistic presentation.",
        ],
      },
      {
        title: "What We Offer",
        image: "nailtology-2.jpeg",
        paragraphs: [
          "Nailtology Fundamentals includes web-based curriculum, hands-on practice lessons, tool identification, sanitation awareness, design exploration, career vocabulary, student activities, and teacher support. Students may learn about nail anatomy basics, manicure preparation, station setup, infection control, product organization, polish application concepts, client communication, professional behavior, and creative nail design.",
          "This program may be used during afterschool programs, before-school programs, in-school enrichment, camps, career exploration days, youth development programs, and workforce readiness activities. It is designed to be fun, structured, and educational while helping students connect creativity to career possibilities.",
          "Nailtology does not replace professional licensing or advanced nail technology training. Instead, it introduces students to foundational concepts, safe learning practices, and the career pathway in a youth-friendly format.",
        ],
      },
      {
        title: "Who This Program Serves",
        image: "nailtology-3.jpeg",
        paragraphs: [
          "Nailtology is ideal for students in grades 3–12 and is a strong option for schools, afterschool providers, community programs, girls' groups, youth leadership programs, homeschool groups, summer camps, and career exploration organizations.",
          "This program works especially well for students who enjoy art, beauty, design, hands-on learning, small details, color coordination, entrepreneurship, and customer service. It is also a great way to help students practice patience, precision, and task completion.",
        ],
      },
      {
        title: "How Nailtology Benefits Youth",
        image: "nailtology-4.jpeg",
        paragraphs: [
          "Nailtology supports creativity, confidence, focus, responsibility, and communication. Students learn how to prepare a station, organize tools, follow steps, complete a design, and present their work. These activities help students strengthen attention to detail and pride in their accomplishments.",
          "The program also introduces students to the business side of nail care. They begin to understand how nail professionals can work in salons, own businesses, sell products, serve clients, and build careers. This helps youth see beauty and creativity as possible pathways to income, independence, and leadership.",
        ],
      },
      {
        title: "Why Organizations Should Participate",
        image: "nailtology-5.jpeg",
        paragraphs: [
          "Organizations should take part in Nailtology because it offers a highly engaging and visually exciting way to teach career readiness. Students enjoy the creative side, while organizations benefit from a structured program that supports professionalism, hygiene, communication, teamwork, and entrepreneurship.",
          "Nailtology can help organizations attract student interest, increase participation, and offer a unique program that stands out from traditional enrichment activities. It is a strong choice for organizations that want youth to learn, create, and build confidence at the same time.",
        ],
      },
    ],
    ctaTitle: "Call to Action",
    ctaParagraph:
      "When your organization is ready to learn more about Nailtology Fundamentals, reach out through the iFuntology ERP. An Affiliate or team member can help you choose the right package, understand kit options, and prepare for implementation.",
  },
  {
    slug: "skintology",
    title: "Skintology",
    fullTitle: "Skintology Fundamentals",
    shortDescription: "Skincare routines and beauty wellness.",
    image: "lms-4.png",
    gradient:
      "linear-gradient(135deg, #66bb6a 0%, #43a047 50%, #2e7d32 100%)",
    eyebrow: "CAREER EXPLORATION",
    bannerDescription:
      "An interactive career exploration program introducing youth to skin care science, wellness, self-care, hygiene, professionalism, and entrepreneurship.",
    sections: [
      {
        title: "Who We Are",
        image: "skintology-1.jpeg",
        paragraphs: [
          "Skintology Fundamentals is an interactive career exploration program that introduces youth to the science of skin care, wellness, self-care, hygiene, professionalism, and entrepreneurship. Designed specifically for students in grades 3–12, the program helps participants understand the importance of healthy skin habits while exploring careers within the skincare and wellness industries.",
          "Skintology was created to provide students with early exposure to one of the fastest-growing sectors within personal care and wellness. Through engaging lessons and hands-on activities, students discover how skincare professionals combine science, communication, creativity, and customer care to help others feel confident and healthy.",
          "Our goal is to help students connect personal wellness with career possibilities while building lifelong habits that support healthy lifestyles and positive self-image.",
        ],
      },
      {
        title: "What We Offer",
        image: "skintology-2.jpeg",
        paragraphs: [
          "Skintology Fundamentals includes web-based learning, hands-on activities, educator support, student learning materials, and career exploration experiences. Students are introduced to foundational concepts including skin anatomy, skin types, healthy skin habits, product awareness, sanitation, client care, wellness routines, and professional etiquette.",
          "Skintology is designed for use in before-school programs, afterschool programs, summer camps, youth organizations, enrichment initiatives, and career readiness programs.",
        ],
        bullets: [
          "Skin health and wellness education",
          "Basic skin anatomy and functions",
          "Skin type identification",
          "Daily skincare routines",
          "Product knowledge and ingredient awareness",
          "Infection control and sanitation practices",
          "Customer service and communication skills",
          "Professionalism and career exploration",
          "Entrepreneurship and business fundamentals",
        ],
      },
      {
        title: "Who This Program Serves",
        image: "skintology-3.jpeg",
        paragraphs: [
          "Skintology serves students in grades 3–12 and is ideal for schools, community organizations, youth development programs, summer learning initiatives, Boys & Girls Clubs, YMCA programs, homeschool groups, workforce development organizations, and afterschool providers.",
          "This program is especially beneficial for students interested in health, wellness, self-care, skincare, science, beauty, and entrepreneurship.",
        ],
      },
      {
        title: "How Skintology Benefits Youth",
        image: "skintology-4.jpeg",
        paragraphs: [
          "Skintology empowers students to develop healthy habits while building valuable life and career skills. Students learn the importance of cleanliness, self-care, communication, responsibility, and professionalism.",
        ],
        bullets: [
          "Increased self-confidence and self-awareness",
          "Improved understanding of health and wellness",
          "Stronger communication and teamwork skills",
          "Development of critical thinking and problem-solving abilities",
          "Introduction to STEM-related concepts through skin science",
          "Career awareness and workforce readiness",
          "Exposure to entrepreneurship and business ownership opportunities",
        ],
      },
      {
        title: "Why Organizations Should Participate",
        image: "skintology-5.jpeg",
        paragraphs: [
          "Organizations that offer Skintology provide youth with a unique opportunity to learn about wellness and career pathways in an engaging, age-appropriate environment.",
          "The program supports social-emotional learning, workforce readiness, career exploration, health education, and student engagement goals. Skintology helps organizations deliver meaningful experiences that encourage positive habits, confidence, and future planning.",
        ],
      },
    ],
    ctaTitle: "Ready to Get Started?",
    ctaParagraph:
      "Ready to inspire healthy habits and future career possibilities? Visit the iFuntology ERP to explore Skintology Fundamentals, view available kits, review curriculum options, and connect with an Affiliate or team member for implementation support.",
  },
];

export const getCourseBySlug = (slug: string) =>
  COURSES.find((course) => course.slug === slug);
