/**
 * English → Vietnamese glossary for tap-to-translate. One entry per line: `word|part of speech|meaning`.
 * Lookup also tries simple inflections (plural -s/-es, -ed, -ing, -er/-est, -ly).
 */
const RAW = `
breakfast|n|bữa sáng
meal|n|bữa ăn
library|n|thư viện
homework|n|bài tập về nhà
umbrella|n|cái ô, cái dù
fridge|n|tủ lạnh
neighbour|n|hàng xóm
ticket|n|vé
pharmacy|n|hiệu thuốc
medicine|n|thuốc
vet|n|bác sĩ thú y
luggage|n|hành lý
timetable|n|thời gian biểu, lịch trình
wallet|n|ví tiền
recipe|n|công thức nấu ăn
receipt|n|hoá đơn, biên lai
passport|n|hộ chiếu
invitation|n|lời mời, thiệp mời
uniform|n|đồng phục
traffic|n|giao thông
jam|n|sự tắc nghẽn
arrive|v|đến nơi
forget|v|quên
borrow|v|mượn
lend|v|cho mượn
repair|v|sửa chữa
explain|v|giải thích
rent|v|thuê
postpone|v|hoãn lại
apologise|v|xin lỗi
tired|adj|mệt
delicious|adj|ngon
noisy|adj|ồn ào
expensive|adj|đắt
crowded|adj|đông đúc
dangerous|adj|nguy hiểm
honest|adj|trung thực
polite|adj|lịch sự
lazy|adj|lười biếng
shy|adj|nhút nhát
curious|adj|tò mò
generous|adj|hào phóng
punctual|adj|đúng giờ
nervous|adj|lo lắng, hồi hộp
ancient|adj|cổ xưa
evidence|n|bằng chứng
benefit|n|lợi ích
research|n|nghiên cứu
method|n|phương pháp
impact|n|tác động
approach|n|cách tiếp cận
consequence|n|hậu quả
data|n|dữ liệu
region|n|khu vực, vùng
trend|n|xu hướng
factor|n|yếu tố
policy|n|chính sách
hypothesis|n|giả thuyết
analyse|v|phân tích
require|v|yêu cầu, cần
estimate|v|ước tính
indicate|v|chỉ ra, cho thấy
contribute|v|đóng góp
emerge|v|xuất hiện, nổi lên
implement|v|thực hiện, triển khai
interpret|v|giải thích, diễn giải
vary|v|thay đổi, khác nhau
previous|adj|trước đó
significant|adj|đáng kể, quan trọng
sustainable|adj|bền vững
begin|v|bắt đầu
start|v|bắt đầu
finish|v|kết thúc, hoàn thành
big|adj|to, lớn
large|adj|lớn
small|adj|nhỏ
rapid|adj|nhanh chóng
fast|adj|nhanh
slow|adj|chậm
difficult|adj|khó
challenging|adj|đầy thử thách
easy|adj|dễ
wealthy|adj|giàu có
rich|adj|giàu
poor|adj|nghèo
silent|adj|im lặng
quiet|adj|yên tĩnh
loud|adj|to, ồn
purchase|v|mua
buy|v|mua
sell|v|bán
famous|adj|nổi tiếng
well-known|adj|nổi tiếng
unknown|adj|không ai biết
fortunate|adj|may mắn
lucky|adj|may mắn
unlucky|adj|không may
assist|v|hỗ trợ
help|v|giúp đỡ
enormous|adj|khổng lồ
huge|adj|rất lớn
tiny|adj|rất nhỏ, tí hon
increase|v|tăng
rise|v|tăng, dâng lên
decrease|v|giảm
brave|adj|dũng cảm
courageous|adj|can đảm
cowardly|adj|hèn nhát
frequently|adv|thường xuyên
often|adv|thường
rarely|adv|hiếm khi
permit|v|cho phép
allow|v|cho phép
forbid|v|cấm
vanish|v|biến mất
disappear|v|biến mất
appear|v|xuất hiện
improve|v|cải thiện
better|adj|tốt hơn
worse|adj|tệ hơn
attempt|v|cố gắng, thử
try|v|thử, cố gắng
obvious|adj|rõ ràng
clear|adj|rõ ràng
hidden|adj|bị giấu, ẩn
hostile|adj|thù địch
unfriendly|adj|không thân thiện
friendly|adj|thân thiện
essential|adj|thiết yếu
vital|adj|cực kỳ quan trọng
unnecessary|adj|không cần thiết
genuine|adj|thật, chính hãng
real|adj|thật
fake|adj|giả
fragile|adj|dễ vỡ
broken|adj|bị vỡ, bị hỏng
strong|adj|mạnh, khoẻ
reveal|v|tiết lộ
show|v|cho thấy
hide|v|giấu
accelerate|v|tăng tốc
temporary|adj|tạm thời
permanent|adj|lâu dài, vĩnh viễn
vague|adj|mơ hồ
unclear|adj|không rõ
precise|adj|chính xác
abundant|adj|dồi dào
plentiful|adj|nhiều, dồi dào
scarce|adj|khan hiếm
reluctant|adj|miễn cưỡng
unwilling|adj|không muốn
eager|adj|háo hức
mitigate|v|giảm nhẹ
lessen|v|làm giảm bớt
worsen|v|làm tệ hơn
ubiquitous|adj|có mặt khắp nơi
everywhere|adv|khắp nơi
rare|adj|hiếm
decision|n|quyết định
decide|v|quyết định
beautiful|adj|đẹp
happiness|n|hạnh phúc
happy|adj|vui, hạnh phúc
careful|adj|cẩn thận
quick|adj|nhanh
success|n|thành công
successful|adj|thành công
creative|adj|sáng tạo
create|v|tạo ra
danger|n|mối nguy hiểm
friendship|n|tình bạn
difference|n|sự khác biệt
different|adj|khác
education|n|giáo dục
pollution|n|ô nhiễm
pollute|v|làm ô nhiễm
active|adj|năng động
patience|n|sự kiên nhẫn
patient|adj|kiên nhẫn
powerful|adj|mạnh mẽ
invention|n|phát minh
invent|v|phát minh
harmful|adj|có hại
reliable|adj|đáng tin cậy
rely|v|dựa vào
production|n|sản xuất, sản lượng
productive|adj|năng suất, hiệu quả
communication|n|giao tiếp
communicate|v|giao tiếp
responsibility|n|trách nhiệm
responsible|adj|có trách nhiệm
population|n|dân số
economy|n|nền kinh tế
economic|adj|thuộc kinh tế
argument|n|cuộc tranh cãi, lập luận
discovery|n|sự khám phá
discover|v|khám phá, phát hiện
minimise|v|giảm thiểu
mistake|n|lỗi sai
decision|n|quyết định
attention|n|sự chú ý
photo|n|bức ảnh
question|n|câu hỏi
noise|n|tiếng ồn
truth|n|sự thật
joke|n|câu chuyện cười
rain|n|mưa
wind|n|gió
coffee|n|cà phê
weak|adj|yếu, loãng
exam|n|bài thi, kỳ thi
match|n|trận đấu
nap|n|giấc ngủ ngắn
asleep|adj|đang ngủ
opponent|n|đối thủ
goal|n|bàn thắng; mục tiêu
waste|v|lãng phí
promise|n|lời hứa
party|n|bữa tiệc
risk|n|rủi ro
sense|n|ý nghĩa, lý lẽ
progress|n|sự tiến bộ
speech|n|bài phát biểu
effort|n|nỗ lực
problem|n|vấn đề
profit|n|lợi nhuận
role|n|vai trò
technology|n|công nghệ
climate|n|khí hậu
law|n|luật
effect|n|tác động, ảnh hưởng
visit|v|thăm
eat|v|ăn
see|v|nhìn thấy, xem
write|v|viết
read|v|đọc
meet|v|gặp
take|v|lấy, đi (xe)
clean|v|dọn dẹp
watch|v|xem
make|v|làm, chế tạo
learn|v|học
build|v|xây dựng
play|v|chơi
ride|v|cưỡi, đi (xe)
swim|v|bơi
letter|n|lá thư
grandma|n|bà
bike|n|xe đạp
neighbour|n|hàng xóm
kitchen|n|nhà bếp
final|n|trận chung kết
cake|n|bánh ngọt
song|n|bài hát
robot|n|người máy
horse|n|con ngựa
sea|n|biển
yesterday|adv|hôm qua
weekend|n|cuối tuần
ago|adv|trước đây
already|adv|đã … rồi
yet|adv|chưa (câu phủ định), rồi chưa (câu hỏi)
ever|adv|từng, đã bao giờ
since|prep|kể từ
arrived|v|đã đến
summer|n|mùa hè
speak|v|nói
grow|v|trồng, mọc
rice|n|lúa, gạo
deliver|v|giao (hàng)
produce|v|sản xuất
country|n|đất nước
countries|n|các nước
tower|n|tháp
telephone|n|điện thoại
window|n|cửa sổ
storm|n|cơn bão
thief|n|kẻ trộm
catch|v|bắt
result|n|kết quả
announce|v|thông báo
winner|n|người thắng
choose|v|chọn
steal|v|ăn trộm
species|n|loài
frog|n|con ếch
bridge|n|cây cầu
road|n|con đường
closed|adj|đóng cửa, bị chặn
house|n|ngôi nhà
phone|n|điện thoại
recycle|v|tái chế
bottle|n|cái chai
essay|n|bài luận
helmet|n|mũ bảo hiểm
wear|v|mặc, đội
temple|n|ngôi đền, chùa
paint|v|vẽ, sơn
cancel|v|huỷ
prize|n|giải thưởng
ceremony|n|buổi lễ
airport|n|sân bay
order|n|đơn hàng
concert|n|buổi hoà nhạc
widen|v|mở rộng
girl|n|cô gái
boy|n|cậu bé
man|n|người đàn ông
woman|n|người phụ nữ
teacher|n|giáo viên
doctor|n|bác sĩ
player|n|cầu thủ, người chơi
race|n|cuộc đua
kind|adj|tốt bụng
hospital|n|bệnh viện
film|n|bộ phim
scary|adj|đáng sợ
exciting|adj|hấp dẫn, thú vị
shoes|n|đôi giày
café|n|quán cà phê
town|n|thị trấn
beach|n|bãi biển
turtle|n|con rùa
school|n|trường học
village|n|ngôi làng
born|adj|được sinh ra
park|n|công viên
hotel|n|khách sạn
city|n|thành phố
stolen|adj|bị đánh cắp
police|n|cảnh sát
dog|n|con chó
bark|v|sủa
upstairs|adv|trên lầu
student|n|học sinh
singer|n|ca sĩ
author|n|tác giả
museum|n|bảo tàng
fascinating|adj|rất thú vị
free|adj|miễn phí; tự do
retire|v|nghỉ hưu
visitor|n|du khách
headteacher|n|hiệu trưởng
chess|n|cờ vua
club|n|câu lạc bộ
cave|n|hang động
if|conj|nếu
study|v|học
harder|adv|chăm chỉ hơn
pass|v|vượt qua, thi đỗ
guitar|n|đàn ghi-ta
train|n|tàu hoả
taxi|n|xe taxi
time|n|thời gian; đúng giờ (on time)
practise|v|luyện tập
competition|n|cuộc thi
save|v|tiết kiệm; cứu
money|n|tiền
news|n|tin tức
weather|n|thời tiết
hot|adj|nóng
tall|adj|cao
cheap|adj|rẻ
elephant|n|con voi
month|n|tháng
brother|n|anh/em trai
sister|n|chị/em gái
beef|n|thịt bò
chicken|n|thịt gà
health|n|sức khoẻ
sleep|n|giấc ngủ
busy|adj|bận rộn, đông đúc
market|n|chợ
thin|adj|mỏng, gầy
popular|adj|phổ biến, được ưa chuộng
early|adj|sớm
far|adj|xa
planet|n|hành tinh
number|n|con số
cost|v|có giá
surname|n|họ
spell|v|đánh vần
total|n|tổng cộng
morning|n|buổi sáng
afternoon|n|buổi chiều
people|n|mọi người
honeybee|n|ong mật
communicate|v|giao tiếp
dance|n|điệu nhảy
flower|n|bông hoa
hive|n|tổ ong
pattern|n|mẫu, hình
angle|n|góc
direction|n|hướng
distance|n|khoảng cách
length|n|độ dài
teenager|n|thiếu niên
online|adj|trực tuyến
video|n|video
skill|n|kỹ năng
noticeably|adv|một cách rõ rệt
writing|n|kỹ năng viết
challenge|n|thử thách
system|n|hệ thống
underground|adj|dưới lòng đất
railway|n|đường sắt
planner|n|nhà quy hoạch
lane|n|làn đường
station|n|nhà ga, bến
passenger|n|hành khách
fraction|n|phân số; một phần nhỏ
expert|n|chuyên gia
platform|n|nền tảng
dramatically|adv|một cách đáng kể
planning|n|việc lập kế hoạch
limited|adj|hạn chế
claim|v|khẳng định
result|n|kết quả
rectangle|n|hình chữ nhật
triangle|n|hình tam giác
square|n|hình vuông
circle|n|hình tròn
trapezium|n|hình thang
area|n|diện tích
perimeter|n|chu vi
base|n|đáy
height|n|chiều cao
width|n|chiều rộng
side|n|cạnh
parallel|adj|song song
radius|n|bán kính
circumference|n|chu vi (hình tròn)
hypotenuse|n|cạnh huyền
leg|n|cạnh góc vuông
right|adj|vuông (góc); đúng; bên phải
interior|adj|bên trong
polygon|n|đa giác
regular|adj|đều
degree|n|độ
straight|adj|thẳng
line|n|đường thẳng
sum|n|tổng
mean|n|trung bình cộng
median|n|trung vị
probability|n|xác suất
bag|n|cái túi
ball|n|quả bóng
red|adj|màu đỏ
blue|adj|màu xanh dương
coin|n|đồng xu
toss|v|tung
head|n|mặt ngửa (đồng xu); cái đầu
dice|n|xúc xắc
roll|v|tung (xúc xắc)
shirt|n|áo sơ mi
trousers|n|quần dài
outfit|n|bộ trang phục
friend|n|bạn
handshake|n|cái bắt tay
shake|v|lắc; bắt (tay)
price|n|giá
increase|n|sự tăng
original|adj|ban đầu
pen|n|cái bút
pay|v|trả tiền
old|adj|già; cũ
together|adv|cùng nhau
speed|n|tốc độ
hour|n|giờ
distance|n|quãng đường
solve|v|giải
simplify|v|rút gọn
expand|v|khai triển
find|v|tìm
value|n|giá trị
next|adj|tiếp theo
taller|adj|cao hơn
tallest|adj|cao nhất
shortest|adj|thấp nhất
face|v|quay mặt về
turn|v|rẽ, quay
around|adv|quay lại
north|n|hướng Bắc
south|n|hướng Nam
east|n|hướng Đông
west|n|hướng Tây
must|v|phải
true|adj|đúng
bird|n|con chim
animal|n|động vật
rose|n|hoa hồng
mammal|n|động vật có vú
dolphin|n|cá heo
fish|n|con cá
cat|n|con mèo
reptile|n|loài bò sát
star|n|ngôi sao
nothing|n|không có gì
conclude|v|kết luận
certain|adj|chắc chắn
knight|n|quân mã (cờ vua); hiệp sĩ
bishop|n|quân tượng
rook|n|quân xe
queen|n|quân hậu
king|n|quân vua
pawn|n|quân tốt
move|n|nước đi
checkmate|n|chiếu hết
fork|n|đòn chĩa (tấn công hai quân)
pinned|adj|bị ghim
passage|n|đoạn văn
heading|n|tiêu đề
mainly|adv|chủ yếu
infer|v|suy ra
attitude|n|thái độ
writer|n|tác giả, người viết
paraphrase|n|diễn đạt lại
opposite|n|từ trái nghĩa
closest|adj|gần nhất
meaning|n|nghĩa
complete|v|hoàn thành, điền vào
form|n|dạng
word|n|từ
`;

export interface Gloss {
  word: string;
  pos: string;
  vi: string;
}

export const GLOSSARY: Map<string, Gloss> = new Map(
  RAW.trim()
    .split('\n')
    .map((line) => line.split('|'))
    .filter((p) => p.length === 3)
    .map(([word, pos, vi]) => [word.toLowerCase(), { word, pos, vi }]),
);

const IRREGULAR: Record<string, string> = {
  went: 'go', gone: 'go', ate: 'eat', eaten: 'eat', saw: 'see', seen: 'see', wrote: 'write', written: 'write', bought: 'buy', met: 'meet',
  took: 'take', taken: 'take', made: 'make', built: 'build', rode: 'ride', ridden: 'ride', swam: 'swim', swum: 'swim', spoke: 'speak',
  spoken: 'speak', grew: 'grow', grown: 'grow', caught: 'catch', chose: 'choose', chosen: 'choose', stole: 'steal', broke: 'break',
  wore: 'wear', worn: 'wear', sold: 'sell', gave: 'give', given: 'give', children: 'child', people: 'people', women: 'woman', men: 'man',
  better: 'better', best: 'good', worst: 'bad', lent: 'lend', forgot: 'forget', forgotten: 'forget',
};

/** Finds a glossary entry for a word as it appears in text (handles simple inflections). */
export function lookup(token: string): Gloss | undefined {
  const w = token.toLowerCase().replace(/[’']s$/, '');
  const direct = GLOSSARY.get(w) ?? (IRREGULAR[w] ? GLOSSARY.get(IRREGULAR[w]) : undefined);
  if (direct) return direct;
  const tries = [
    w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/ed$/, ''), w.replace(/ed$/, 'e'), w.replace(/d$/, ''),
    w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/([a-z])\1ing$/, '$1'), w.replace(/([a-z])\1ed$/, '$1'), w.replace(/ly$/, ''),
    w.replace(/ier$/, 'y'), w.replace(/er$/, ''), w.replace(/est$/, ''), w.replace(/([a-z])\1er$/, '$1'), w.replace(/([a-z])\1est$/, '$1'),
  ];
  for (const t of tries) if (t !== w && GLOSSARY.has(t)) return GLOSSARY.get(t);
  return undefined;
}
