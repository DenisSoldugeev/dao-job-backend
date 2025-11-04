import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Seed categories
  const development = await prisma.category.upsert({
    where: { slug: 'development' },
    update: {},
    create: {
      slug: 'development',
      title: 'Разработка',
      description: 'Создание и разработка веб-приложений, мобильных приложений, сайтов и других цифровых продуктов',
      sort: 1,
      active: true,
    },
  });

  const design = await prisma.category.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      slug: 'design',
      title: 'Дизайн',
      description: 'Создание визуального контента, дизайн интерфейсов, графический и моушн дизайн',
      sort: 2,
      active: true,
    },
  });

  const marketing = await prisma.category.upsert({
    where: { slug: 'marketing' },
    update: {},
    create: {
      slug: 'marketing',
      title: 'Маркетинг',
      description: 'Продвижение продуктов и услуг, работа с социальными сетями, SEO оптимизация и контент-маркетинг',
      sort: 3,
      active: true,
    },
  });

  console.log('Categories created:', { development, design, marketing });

  // Seed specializations for Development
  await prisma.specialization.createMany({
    data: [
      {
        slug: 'frontend',
        title: 'Frontend разработка',
        categoryId: development.id,
        sort: 1,
        active: true,
      },
      {
        slug: 'backend',
        title: 'Backend разработка',
        categoryId: development.id,
        sort: 2,
        active: true,
      },
      {
        slug: 'mobile',
        title: 'Мобильная разработка',
        categoryId: development.id,
        sort: 3,
        active: true,
      },
      {
        slug: 'fullstack',
        title: 'Fullstack разработка',
        categoryId: development.id,
        sort: 4,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  // Seed specializations for Design
  await prisma.specialization.createMany({
    data: [
      {
        slug: 'uiux',
        title: 'UI/UX дизайн',
        categoryId: design.id,
        sort: 1,
        active: true,
      },
      {
        slug: 'graphic',
        title: 'Графический дизайн',
        categoryId: design.id,
        sort: 2,
        active: true,
      },
      {
        slug: 'motion',
        title: 'Motion дизайн',
        categoryId: design.id,
        sort: 3,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  // Seed specializations for Marketing
  await prisma.specialization.createMany({
    data: [
      {
        slug: 'smm',
        title: 'SMM',
        categoryId: marketing.id,
        sort: 1,
        active: true,
      },
      {
        slug: 'content',
        title: 'Контент-маркетинг',
        categoryId: marketing.id,
        sort: 2,
        active: true,
      },
      {
        slug: 'seo',
        title: 'SEO',
        categoryId: marketing.id,
        sort: 3,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Specializations created');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
