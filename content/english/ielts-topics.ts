/**
 * IELTS topic vocabulary: the phrases (collocations) a band-6.5 answer uses, grouped by the topics IELTS
 * Speaking and Writing keep coming back to. Several match Tiếng Anh 9 Global Success units (city life,
 * healthy living, tourism, Planet Earth, electronic devices, career choices, Vietnamese lifestyle).
 *
 * Each phrase: [phrase, meaning in simple English, Vietnamese, example with ___ where the phrase goes].
 */
import { makeBank, type ConceptSeed } from '../helpers';

type Phrase = [string, string, string, string];

interface Topic {
  id: string;
  name: string;
  vi: string;
  unit?: string;
  phrases: Phrase[];
}

export const IELTS_TOPICS: Topic[] = [
  {
    id: 'education',
    name: 'Education',
    vi: 'Giáo dục',
    phrases: [
      ['academic performance', 'how well a student does at school', 'kết quả học tập', 'Regular sleep can improve your ___.'],
      ['extracurricular activities', 'clubs and hobbies outside lessons', 'hoạt động ngoại khóa', 'Many schools offer ___ such as chess club and drama.'],
      ['lifelong learning', 'continuing to learn throughout your life', 'học tập suốt đời', 'Online courses make ___ easier for adults.'],
      ['rote learning', 'memorising without understanding', 'học vẹt', 'Critics say ___ does not help students think creatively.'],
      ['hands-on experience', 'learning by actually doing something', 'kinh nghiệm thực tế', 'Science labs give students ___.'],
      ['tuition fees', 'money paid to study at a school or university', 'học phí', 'Some students take part-time jobs to pay their ___.'],
      ['peer pressure', 'pressure from friends of the same age', 'áp lực từ bạn bè', 'Teenagers sometimes start bad habits because of ___.'],
      ['critical thinking', 'judging ideas carefully and logically', 'tư duy phản biện', 'Debating helps students develop ___.'],
      ['a well-rounded education', 'an education that covers many different areas', 'nền giáo dục toàn diện', 'Sport and art are part of ___.'],
      ['fall behind', 'make less progress than others', 'bị tụt lại phía sau', 'Students who miss many lessons may ___.'],
    ],
  },
  {
    id: 'environment',
    name: 'Environment',
    vi: 'Môi trường',
    unit: 'Unit 10 Planet Earth',
    phrases: [
      ['climate change', 'long-term change in the Earth\'s weather', 'biến đổi khí hậu', 'Rising sea levels are one effect of ___.'],
      ['greenhouse gas emissions', 'gases released that trap heat in the air', 'khí thải nhà kính', 'Cars and factories produce ___.'],
      ['renewable energy', 'energy from sources that don\'t run out, like sun and wind', 'năng lượng tái tạo', 'Solar panels are a source of ___.'],
      ['carbon footprint', 'the amount of carbon dioxide a person or activity produces', 'lượng khí thải các-bon', 'Taking the bus reduces your ___.'],
      ['endangered species', 'animals or plants that may soon disappear', 'loài có nguy cơ tuyệt chủng', 'The Saola is one of Vietnam\'s ___.'],
      ['natural habitat', 'the place where an animal naturally lives', 'môi trường sống tự nhiên', 'Cutting down forests destroys the ___ of many animals.'],
      ['single-use plastic', 'plastic thrown away after one use', 'nhựa dùng một lần', 'Many cafés have stopped using ___ straws.'],
      ['raise awareness', 'make people know more about a problem', 'nâng cao nhận thức', 'The campaign aims to ___ about air pollution.'],
      ['take drastic measures', 'act strongly to solve a problem', 'có biện pháp quyết liệt', 'Governments must ___ to cut pollution.'],
      ['dispose of waste', 'get rid of rubbish', 'xử lý rác thải', 'Factories must ___ safely.'],
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    vi: 'Công nghệ',
    unit: 'Unit 11 Electronic devices',
    phrases: [
      ['screen time', 'time spent looking at phones, computers or TV', 'thời gian dùng thiết bị điện tử', 'Doctors advise teenagers to limit their ___.'],
      ['cutting-edge technology', 'the newest and most advanced technology', 'công nghệ tiên tiến nhất', 'The new hospital uses ___.'],
      ['artificial intelligence', 'computers that can think and learn', 'trí tuệ nhân tạo', '___ can translate languages in seconds.'],
      ['social media platforms', 'websites and apps for sharing with others', 'nền tảng mạng xã hội', 'Facebook and TikTok are popular ___.'],
      ['online privacy', 'keeping your personal information safe on the internet', 'quyền riêng tư trên mạng', 'Strong passwords protect your ___.'],
      ['digital literacy', 'the skills to use technology well and safely', 'kỹ năng số', 'Schools should teach ___ from an early age.'],
      ['be addicted to', 'be unable to stop doing something', 'nghiện', 'Some teenagers ___ online games.'],
      ['keep in touch', 'stay in contact', 'giữ liên lạc', 'Video calls help families ___.'],
      ['a technological breakthrough', 'an important new discovery in technology', 'bước đột phá công nghệ', 'The smartphone was ___.'],
      ['user-friendly', 'easy to use', 'dễ sử dụng', 'This app is very ___, even for my grandparents.'],
    ],
  },
  {
    id: 'health',
    name: 'Health',
    vi: 'Sức khỏe',
    unit: 'Unit 3 Healthy living for teens',
    phrases: [
      ['a sedentary lifestyle', 'a way of life with very little exercise', 'lối sống ít vận động', 'Sitting at a computer all day leads to ___.'],
      ['a balanced diet', 'eating the right amounts of different foods', 'chế độ ăn cân bằng', 'Fruit and vegetables are part of ___.'],
      ['junk food', 'unhealthy food with lots of fat, salt or sugar', 'đồ ăn vặt không lành mạnh', 'Eating too much ___ can cause obesity.'],
      ['mental health', 'the health of your mind and feelings', 'sức khỏe tinh thần', 'Exam stress can affect students\' ___.'],
      ['get enough sleep', 'sleep the amount your body needs', 'ngủ đủ giấc', 'Teenagers need to ___ to concentrate in class.'],
      ['stay in shape', 'keep your body fit', 'giữ dáng', 'My father swims every morning to ___.'],
      ['life expectancy', 'how long people are expected to live', 'tuổi thọ trung bình', '___ in Vietnam has risen in recent decades.'],
      ['a healthy work-life balance', 'enough time for both work and rest', 'sự cân bằng giữa công việc và cuộc sống', 'Long working hours make ___ difficult.'],
      ['cut down on', 'reduce the amount of something', 'cắt giảm', 'You should ___ sugary drinks.'],
      ['under pressure', 'feeling stressed because of demands', 'chịu áp lực', 'Students are often ___ before exams.'],
    ],
  },
  {
    id: 'work',
    name: 'Work and careers',
    vi: 'Công việc và nghề nghiệp',
    unit: 'Unit 12 Career choices',
    phrases: [
      ['job security', 'not being likely to lose your job', 'sự ổn định trong công việc', 'Many people choose government jobs for ___.'],
      ['job satisfaction', 'the good feeling of enjoying your work', 'sự hài lòng với công việc', 'Helping others gives nurses great ___.'],
      ['a career path', 'the series of jobs you do in your working life', 'con đường sự nghiệp', 'Choosing ___ at 15 is not easy.'],
      ['vocational training', 'training for a particular skilled job', 'đào tạo nghề', 'Not everyone needs university; ___ is also valuable.'],
      ['a competitive salary', 'pay that is as good as or better than other jobs', 'mức lương cạnh tranh', 'Tech companies offer ___ to attract engineers.'],
      ['gain experience', 'learn skills by doing a job', 'tích lũy kinh nghiệm', 'Summer jobs help students ___.'],
      ['meet a deadline', 'finish work by the time it is due', 'kịp hạn chót', 'We worked late to ___.'],
      ['a nine-to-five job', 'an office job with regular hours', 'công việc giờ hành chính', 'He left ___ to start his own business.'],
      ['the job market', 'the jobs available and the people looking for them', 'thị trường việc làm', 'English skills give you an advantage in ___.'],
      ['work as a team', 'cooperate with others', 'làm việc nhóm', 'Good employees can ___.'],
    ],
  },
  {
    id: 'city',
    name: 'City life',
    vi: 'Cuộc sống đô thị',
    unit: 'Unit 2 City life',
    phrases: [
      ['traffic congestion', 'too many vehicles on the roads', 'ùn tắc giao thông', 'Hà Nội suffers from heavy ___ at rush hour.'],
      ['public transport', 'buses and trains everyone can use', 'giao thông công cộng', 'The metro has improved ___ in the city.'],
      ['rush hour', 'the busy time when people go to and from work', 'giờ cao điểm', 'Roads are crowded during ___.'],
      ['urban sprawl', 'cities growing outwards into the countryside', 'sự mở rộng đô thị tràn lan', '___ has replaced many rice fields.'],
      ['the cost of living', 'how much money you need for daily life', 'chi phí sinh hoạt', '___ in big cities is very high.'],
      ['high-rise buildings', 'very tall buildings', 'nhà cao tầng', 'New ___ are changing the skyline.'],
      ['air quality', 'how clean the air is', 'chất lượng không khí', 'Poor ___ is a problem in winter.'],
      ['green spaces', 'parks and areas with plants in a city', 'không gian xanh', 'Cities need more ___ for people to relax.'],
      ['overcrowded', 'with too many people', 'quá đông đúc', 'Buses are often ___ in the morning.'],
      ['a vibrant nightlife', 'lots of exciting things to do in the evening', 'cuộc sống về đêm sôi động', 'The Old Quarter has ___.'],
    ],
  },
  {
    id: 'tourism',
    name: 'Travel and tourism',
    vi: 'Du lịch',
    unit: 'Unit 8 Tourism',
    phrases: [
      ['a tourist attraction', 'a place many visitors go to see', 'điểm thu hút khách du lịch', 'Hạ Long Bay is a famous ___.'],
      ['off the beaten track', 'far from the places most tourists visit', 'nơi ít người biết đến', 'We found a quiet village ___.'],
      ['a package holiday', 'a trip where travel and hotel are sold together', 'tour du lịch trọn gói', 'A ___ is cheaper than booking everything yourself.'],
      ['broaden your horizons', 'learn about new things and ideas', 'mở rộng tầm hiểu biết', 'Travelling abroad can ___.'],
      ['ecotourism', 'tourism that protects nature', 'du lịch sinh thái', '___ is growing in Cúc Phương National Park.'],
      ['the local economy', 'businesses and jobs in an area', 'kinh tế địa phương', 'Tourism brings money into ___.'],
      ['cultural heritage', 'traditions and places passed down from the past', 'di sản văn hóa', 'Hội An is part of Vietnam\'s ___.'],
      ['go sightseeing', 'visit interesting places as a tourist', 'đi tham quan', 'We will ___ in Huế tomorrow.'],
      ['a breathtaking view', 'an extremely beautiful view', 'cảnh đẹp ngoạn mục', 'From the top of Fansipan there is ___.'],
      ['mass tourism', 'very large numbers of tourists in one place', 'du lịch đại trà', '___ can damage the environment.'],
    ],
  },
  {
    id: 'media',
    name: 'Media and advertising',
    vi: 'Truyền thông và quảng cáo',
    phrases: [
      ['fake news', 'false stories that look like real news', 'tin giả', 'Always check the source to avoid ___.'],
      ['go viral', 'spread very quickly online', 'lan truyền nhanh chóng', 'The video ___ overnight.'],
      ['target audience', 'the group of people something is aimed at', 'đối tượng khán giả mục tiêu', 'Teenagers are the ___ of this advert.'],
      ['a celebrity endorsement', 'a famous person promoting a product', 'người nổi tiếng quảng bá sản phẩm', 'The brand used ___ to sell more shoes.'],
      ['freedom of the press', 'the right of newspapers to report freely', 'tự do báo chí', '___ is important in a democracy.'],
      ['influence public opinion', 'change what people in general think', 'tác động đến dư luận', 'Newspapers can ___.'],
      ['a reliable source', 'a source of information you can trust', 'nguồn tin đáng tin cậy', 'Use ___ for your school project.'],
      ['make headlines', 'become important news', 'trở thành tin nổi bật', 'The young chess player ___ after winning the tournament.'],
      ['online content', 'videos, posts and articles on the internet', 'nội dung trực tuyến', 'Parents worry about ___ their children see.'],
      ['commercial break', 'the time when adverts are shown on TV', 'giờ nghỉ quảng cáo', 'We made tea during the ___.'],
    ],
  },
  {
    id: 'family',
    name: 'Family and society',
    vi: 'Gia đình và xã hội',
    phrases: [
      ['the generation gap', 'differences between young and old people', 'khoảng cách thế hệ', '___ can cause arguments at home.'],
      ['an extended family', 'a family including grandparents, aunts and uncles', 'gia đình nhiều thế hệ', 'Many Vietnamese people live in ___.'],
      ['a nuclear family', 'parents and their children only', 'gia đình hạt nhân', '___ is becoming more common in cities.'],
      ['household chores', 'jobs at home like cleaning and cooking', 'việc nhà', 'Children should help with ___.'],
      ['bring up', 'raise a child', 'nuôi dạy', 'My grandparents helped ___ my cousins.'],
      ['take after', 'look or behave like an older family member', 'giống (người lớn trong gia đình)', 'He ___ his father — they both love chess.'],
      ['respect for elders', 'treating older people with honour', 'kính trọng người lớn tuổi', '___ is an important Vietnamese value.'],
      ['quality time', 'time spent together giving full attention', 'thời gian chất lượng bên nhau', 'Families should spend ___ together at weekends.'],
      ['get on well with', 'have a friendly relationship with', 'hòa hợp với', 'I ___ my younger sister.'],
      ['an ageing population', 'a society with a growing number of old people', 'dân số già hóa', 'Japan has ___.'],
    ],
  },
  {
    id: 'food',
    name: 'Food',
    vi: 'Ẩm thực',
    phrases: [
      ['a staple food', 'a basic food eaten every day', 'lương thực chính', 'Rice is ___ in Vietnam.'],
      ['street food', 'food sold and eaten in the street', 'đồ ăn đường phố', 'Phở and bánh mì are famous ___.'],
      ['home-cooked meals', 'food made at home', 'bữa cơm nhà nấu', 'I prefer ___ to fast food.'],
      ['processed food', 'food changed by factories, often with chemicals', 'thực phẩm chế biến sẵn', '___ often contains too much salt.'],
      ['eat out', 'eat at a restaurant', 'ăn ngoài', 'We usually ___ on Sunday evenings.'],
      ['a mouth-watering dish', 'food that looks or smells delicious', 'món ăn hấp dẫn', 'My grandmother cooks ___ for Tết.'],
      ['food safety', 'keeping food clean and safe to eat', 'an toàn thực phẩm', 'Restaurants must follow ___ rules.'],
      ['organic produce', 'fruit and vegetables grown without chemicals', 'nông sản hữu cơ', '___ is more expensive but healthier.'],
      ['a sweet tooth', 'a love of sugary food', 'thích ăn đồ ngọt', 'My brother has ___ — he eats chè every day.'],
      ['skip breakfast', 'not eat breakfast', 'bỏ bữa sáng', 'You shouldn\'t ___ before an exam.'],
    ],
  },
  {
    id: 'sport',
    name: 'Sport and leisure',
    vi: 'Thể thao và giải trí',
    phrases: [
      ['take up a hobby', 'start doing a new hobby', 'bắt đầu một sở thích', 'I ___ chess when I was eight.'],
      ['a team sport', 'a sport played in groups, like football', 'môn thể thao đồng đội', 'Football is the most popular ___ in Vietnam.'],
      ['physical activity', 'moving your body', 'hoạt động thể chất', 'Children need an hour of ___ every day.'],
      ['a sense of achievement', 'a proud feeling after doing something hard', 'cảm giác thành tựu', 'Finishing the marathon gave me ___.'],
      ['spare time', 'free time', 'thời gian rảnh', 'What do you do in your ___?'],
      ['work out', 'exercise to get fit', 'tập thể dục', 'My cousin ___ at the gym three times a week.'],
      ['a strategy game', 'a game where you plan your moves carefully', 'trò chơi chiến thuật', 'Chess is a classic ___.'],
      ['let off steam', 'release energy or strong feelings', 'xả căng thẳng', 'Playing football helps me ___ after school.'],
      ['a die-hard fan', 'a very loyal supporter', 'người hâm mộ cuồng nhiệt', 'My father is ___ of the national team.'],
      ['sportsmanship', 'fair and polite behaviour in sport', 'tinh thần thể thao', 'Shaking hands after a match shows good ___.'],
    ],
  },
  {
    id: 'culture',
    name: 'Culture and tradition',
    vi: 'Văn hóa và truyền thống',
    unit: 'Unit 6 Vietnamese lifestyle: then and now',
    phrases: [
      ['traditional customs', 'old ways of doing things in a culture', 'phong tục truyền thống', 'Giving lucky money at Tết is one of our ___.'],
      ['preserve traditions', 'keep old traditions alive', 'gìn giữ truyền thống', 'Museums help ___.'],
      ['a way of life', 'the typical way people live', 'lối sống', 'Village life is a different ___.'],
      ['cultural identity', 'the feeling of belonging to a culture', 'bản sắc văn hóa', 'Language is an important part of ___.'],
      ['pass down', 'give to younger generations', 'truyền lại', 'Recipes are ___ from mother to daughter.'],
      ['a national festival', 'a celebration for the whole country', 'lễ hội quốc gia', 'Tết is the biggest ___ in Vietnam.'],
      ['globalisation', 'the world becoming more connected', 'toàn cầu hóa', '___ has brought foreign food to Hà Nội.'],
      ['handicraft villages', 'villages that make traditional hand-made goods', 'làng nghề thủ công', 'Bát Tràng is one of the most famous ___.'],
      ['be proud of', 'feel pleased about something you value', 'tự hào về', 'We ___ our history.'],
      ['modern lifestyle', 'the way people live today', 'lối sống hiện đại', 'Young people are adopting a more ___.'],
    ],
  },
];

export const ieltsTopicConcepts: ConceptSeed[] = IELTS_TOPICS.map((t) => ({
  id: `en.ielts.lex.${t.id}`,
  domain: 'IELTS',
  skill: 'Topic vocabulary',
  name: `IELTS topic: ${t.name}`,
  missionName: `${t.name} Phrasebook`,
  description: `Band 6.5 phrases for ${t.name.toLowerCase()}${t.unit ? ` (Global Success 9 · ${t.unit})` : ''}.`,
  cefr: 'B2',
  lesson: `Learn these as whole phrases — IELTS examiners reward natural collocations: ${t.phrases
    .slice(0, 4)
    .map((p) => p[0])
    .join(', ')}… Use them in your own sentences about Vietnam.`,
  examRefs: ['IELTS Speaking & Writing: lexical resource', ...(t.unit ? [`Global Success 9 · ${t.unit}`] : [])],
}));

/** Vietnamese for the concept lessons (merged into LESSONS_VI). */
export const ieltsTopicLessonsVi: Record<string, string> = Object.fromEntries(
  IELTS_TOPICS.map((t) => [
    `en.ielts.lex.${t.id}`,
    `Học cả cụm từ — giám khảo IELTS đánh giá cao các cụm từ tự nhiên về chủ đề ${t.vi.toLowerCase()}: ${t.phrases
      .slice(0, 4)
      .map((p) => `${p[0]} (${p[2]})`)
      .join(', ')}… Hãy dùng chúng trong câu nói về Việt Nam.`,
  ]),
);

const { add, list } = makeBank('Atlas IELTS topic vocabulary', 't');
for (const t of IELTS_TOPICS) {
  const cid = `en.ielts.lex.${t.id}`;
  const n = t.phrases.length;
  t.phrases.forEach(([phrase, meaning, vi, example], i) => {
    // Distractors: three other phrases from the same topic, different for each question kind.
    const others = (k: number) => [1, 2, 3].map((j) => t.phrases[(i + j * k) % n][0]).filter((p, idx, a) => p !== phrase && a.indexOf(p) === idx);
    const pick3 = (k: number) => {
      const o = others(k);
      for (let j = 4; o.length < 3; j++) if (!o.includes(t.phrases[(i + j) % n][0]) && t.phrases[(i + j) % n][0] !== phrase) o.push(t.phrases[(i + j) % n][0]);
      return o;
    };
    const why = `"${phrase}" = ${meaning} (${vi}).`;
    add(cid, 3, `Complete: ${example}`, [phrase, ...pick3(1)], { explanation: `We say "${example.replace('___', phrase)}" ${why}` });
    add(cid, 2, `Which phrase means "${meaning}"?`, [phrase, ...pick3(3)], { explanation: why });
    add(cid, 4, `Which phrase means "${vi}"?`, [phrase, ...pick3(7)], { explanation: why });
  });
}

export const ieltsTopicQuestions = list;
