import { bi, type PyUnit } from './types';

export const unit: PyUnit = {
  id: 'u12',
  emoji: '🏆',
  title: bi('Challenges', 'Thử thách'),
  blurb: bi('Classic puzzles, like a coding test', 'Những bài toán kinh điển, như một bài kiểm tra lập trình'),
  lessons: [
    {
      id: 'u12-l1',
      title: bi('Warm-up puzzles', 'Khởi động'),
      steps: [
        {
          kind: 'read',
          title: bi('How to solve a puzzle', 'Cách giải một bài toán'),
          text: bi(
            'First, solve one small example by hand. Then ask: what do I repeat? What do I check? The repeat is a loop; the check is an if.',
            'Trước hết, tự giải một ví dụ nhỏ bằng tay. Rồi hỏi: mình lặp lại việc gì? Mình kiểm tra điều gì? Việc lặp là vòng lặp; việc kiểm tra là if.',
          ),
        },
        {
          kind: 'read',
          title: bi('FizzBuzz', 'FizzBuzz'),
          text: bi(
            'A famous test: for each number, print "Fizz" if it divides by 3, "Buzz" if by 5, and "FizzBuzz" if by both. Check "both" first!',
            'Một bài kiểm tra nổi tiếng: với mỗi số, in "Fizz" nếu chia hết cho 3, "Buzz" nếu chia hết cho 5, và "FizzBuzz" nếu chia hết cho cả hai. Phải kiểm tra "cả hai" trước!',
          ),
          code: 'for i in range(1, 6):\n    if i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
          output: '1\n2\nFizz\n4\nBuzz',
        },
        {
          kind: 'choice',
          ask: bi('In FizzBuzz, why must the test for 15 come first?', 'Trong FizzBuzz, tại sao phải kiểm tra 15 trước?'),
          options: [
            bi('Because 15 is the biggest number', 'Vì 15 là số lớn nhất'),
            bi('Because Python checks elif before if', 'Vì Python kiểm tra elif trước if'),
            bi('Because 15 also divides by 3, so "Fizz" would win first', 'Vì 15 cũng chia hết cho 3, nên "Fizz" sẽ được chọn trước'),
          ],
          answer: 2,
          why: bi('if/elif stops at the first True test. If i % 3 comes first, 15 prints "Fizz" and never reaches "FizzBuzz".', 'if/elif dừng ở điều kiện True đầu tiên. Nếu i % 3 đứng trước, 15 sẽ in "Fizz" và không bao giờ tới "FizzBuzz".'),
        },
        {
          kind: 'write',
          task: bi('Write FizzBuzz for the numbers 1 to 15.', 'Viết FizzBuzz cho các số từ 1 đến 15.'),
          starter: 'for i in range(1, 16):\n    # your checks here\n',
          expect: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
          solution: 'for i in range(1, 16):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
          hint: bi('First if i % 15 == 0, then elif i % 3 == 0, then elif i % 5 == 0, else print(i).', 'Đầu tiên if i % 15 == 0, rồi elif i % 3 == 0, rồi elif i % 5 == 0, còn lại print(i).'),
        },
        {
          kind: 'read',
          title: bi('Sum of digits', 'Tổng các chữ số'),
          text: bi(
            'n % 10 is the last digit and n // 10 removes it. Repeat while n > 0.',
            'n % 10 là chữ số cuối và n // 10 bỏ chữ số đó đi. Lặp lại khi n > 0.',
          ),
          code: 'n = 2026\nprint(n % 10)\nprint(n // 10)',
          output: '6\n202',
        },
        {
          kind: 'order',
          ask: bi('Put the lines in order to add up the digits of 1234.', 'Sắp xếp các dòng để tính tổng các chữ số của 1234.'),
          lines: ['n = 1234', 'total = 0', 'while n > 0:', '    total += n % 10', '    n = n // 10', 'print(total)'],
          output: '10',
          why: bi('Each turn adds the last digit and then cuts it off: 4 + 3 + 2 + 1 = 10.', 'Mỗi lượt cộng chữ số cuối rồi bỏ nó đi: 4 + 3 + 2 + 1 = 10.'),
        },
        {
          kind: 'write',
          task: bi('Read a number with input() and print the sum of its digits.', 'Đọc một số bằng input() và in tổng các chữ số của nó.'),
          starter: 'n = int(input())\n',
          expect: '27',
          stdin: ['9549'],
          solution: 'n = int(input())\ntotal = 0\nwhile n > 0:\n    total += n % 10\n    n = n // 10\nprint(total)',
          hint: bi('total = 0, then while n > 0: add n % 10 and do n = n // 10.', 'total = 0, rồi while n > 0: cộng n % 10 và gán n = n // 10.'),
        },
      ],
    },
    {
      id: 'u12-l2',
      title: bi('Strings and lists', 'Chuỗi và danh sách'),
      steps: [
        {
          kind: 'read',
          title: bi('Reverse a string', 'Đảo ngược chuỗi'),
          text: bi(
            's[::-1] reads a string backwards. A palindrome reads the same both ways, like "level".',
            's[::-1] đọc chuỗi theo chiều ngược lại. Chuỗi đối xứng (palindrome) đọc xuôi hay ngược đều giống nhau, như "level".',
          ),
          code: 'word = "python"\nprint(word[::-1])\nprint("level" == "level"[::-1])',
          output: 'nohtyp\nTrue',
        },
        {
          kind: 'fill',
          ask: bi('Check if a word is a palindrome.', 'Kiểm tra một từ có đối xứng không.'),
          code: 'def is_pal(s):\n    return s == s[___]\n\nprint(is_pal("racecar"))\nprint(is_pal("phone"))',
          answers: ['::-1'],
          extra: ['-1', '0', '::1'],
          output: 'True\nFalse',
          why: bi('s[::-1] is the whole string reversed. s[-1] is only the last letter.', 's[::-1] là cả chuỗi đảo ngược. s[-1] chỉ là chữ cuối.'),
        },
        {
          kind: 'write',
          task: bi('Count the vowels (a, e, i, o, u) in the word read by input(), and print the count.', 'Đếm số nguyên âm (a, e, i, o, u) trong từ đọc bằng input(), rồi in số đó.'),
          starter: 'word = input()\ncount = 0\n',
          expect: '5',
          stdin: ['education'],
          solution: 'word = input()\ncount = 0\nfor ch in word:\n    if ch in "aeiou":\n        count += 1\nprint(count)',
          hint: bi('for ch in word: if ch in "aeiou": count += 1', 'for ch in word: if ch in "aeiou": count += 1'),
        },
        {
          kind: 'read',
          title: bi('Biggest without max()', 'Số lớn nhất không dùng max()'),
          text: bi(
            'Pretend the first item is the biggest. Then look at each item: if it is bigger, it becomes the new biggest.',
            'Giả sử phần tử đầu tiên là lớn nhất. Rồi xét từng phần tử: nếu nó lớn hơn thì nó trở thành số lớn nhất mới.',
          ),
        },
        {
          kind: 'order',
          ask: bi('Put the lines in order to find the biggest number without max().', 'Sắp xếp các dòng để tìm số lớn nhất mà không dùng max().'),
          lines: ['nums = [4, 17, 9, 12]', 'best = nums[0]', 'for n in nums:', '    if n > best:', '        best = n', 'print(best)'],
          output: '17',
          why: bi('best starts as 4, changes to 17, and 9 and 12 are smaller, so it stays 17.', 'best bắt đầu là 4, đổi thành 17, còn 9 và 12 nhỏ hơn nên vẫn là 17.'),
        },
        {
          kind: 'choice',
          ask: bi('To find the smallest number this way, what must change?', 'Muốn tìm số nhỏ nhất theo cách này, cần đổi gì?'),
          options: [bi('n > best becomes n < best', 'n > best thành n < best'), bi('nums[0] becomes nums[-1]', 'nums[0] thành nums[-1]'), bi('Nothing changes', 'Không cần đổi gì')],
          answer: 0,
          why: bi('We now keep a number when it is smaller, so the test is n < best. The start can stay nums[0].', 'Giờ ta giữ số khi nó nhỏ hơn, nên điều kiện là n < best. Giá trị bắt đầu vẫn là nums[0].'),
        },
        {
          kind: 'write',
          task: bi(
            'Find the biggest mark in marks = [6, 9, 7, 10, 8] without using max(), and print it.',
            'Tìm điểm cao nhất trong marks = [6, 9, 7, 10, 8] mà không dùng max(), rồi in ra.',
          ),
          starter: 'marks = [6, 9, 7, 10, 8]\nbest = marks[0]\n',
          expect: '10',
          solution: 'marks = [6, 9, 7, 10, 8]\nbest = marks[0]\nfor m in marks:\n    if m > best:\n        best = m\nprint(best)',
          hint: bi('for m in marks: if m > best: best = m. Print after the loop.', 'for m in marks: if m > best: best = m. In ra sau vòng lặp.'),
        },
      ],
    },
    {
      id: 'u12-l3',
      title: bi('Number puzzles', 'Bài toán về số'),
      steps: [
        {
          kind: 'read',
          title: bi('Prime numbers', 'Số nguyên tố'),
          text: bi(
            'A prime is bigger than 1 and divides only by 1 and itself. To test n, try every d from 2 to n - 1: if one divides n, it is not prime.',
            'Số nguyên tố lớn hơn 1 và chỉ chia hết cho 1 và chính nó. Để kiểm tra n, thử mọi d từ 2 đến n - 1: nếu có số chia hết n thì n không phải số nguyên tố.',
          ),
          code: 'def is_prime(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\nprint(is_prime(7), is_prime(9), is_prime(1))',
          output: 'True False False',
        },
        {
          kind: 'write',
          task: bi(
            'Using an is_prime function, print all the prime numbers from 1 to 20, one per line.',
            'Dùng hàm is_prime, in tất cả các số nguyên tố từ 1 đến 20, mỗi số một dòng.',
          ),
          starter: 'def is_prime(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\n# print the primes from 1 to 20\n',
          expect: '2\n3\n5\n7\n11\n13\n17\n19',
          solution: 'def is_prime(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\nfor i in range(1, 21):\n    if is_prime(i):\n        print(i)',
          hint: bi('for i in range(1, 21): if is_prime(i): print(i)', 'for i in range(1, 21): if is_prime(i): print(i)'),
        },
        {
          kind: 'fill',
          ask: bi('Factorial: 5! = 1 × 2 × 3 × 4 × 5. Finish the code.', 'Giai thừa: 5! = 1 × 2 × 3 × 4 × 5. Hoàn thành đoạn code.'),
          code: 'n = 5\nf = ___\nfor i in range(1, n + 1):\n    f = f ___ i\nprint(f)',
          answers: ['1', '*'],
          extra: ['0', '+', '**'],
          output: '120',
          why: bi('Start at 1 (not 0, or everything becomes 0) and multiply by each i.', 'Bắt đầu từ 1 (không phải 0, vì nhân với 0 là ra 0) và nhân với từng i.'),
        },
        {
          kind: 'read',
          title: bi('Fibonacci', 'Dãy Fibonacci'),
          text: bi(
            'Fibonacci starts 1, 1, and each next term is the sum of the two before it. Keep two variables a and b and move them along.',
            'Dãy Fibonacci bắt đầu 1, 1, và mỗi số tiếp theo bằng tổng hai số đứng trước. Giữ hai biến a và b rồi dịch chúng dần lên.',
          ),
          code: 'a, b = 1, 1\nfor i in range(7):\n    print(a)\n    a, b = b, a + b',
          output: '1\n1\n2\n3\n5\n8\n13',
        },
        {
          kind: 'output',
          ask: bi('Type what this prints.', 'Gõ những gì chương trình này in ra.'),
          code: 'a, b = 1, 1\nfor i in range(5):\n    a, b = b, a + b\nprint(a)',
          answer: '8',
          why: bi('a goes 1 → 1 → 2 → 3 → 5 → 8 after five steps.', 'Sau năm bước a lần lượt là 1 → 1 → 2 → 3 → 5 → 8.'),
        },
        {
          kind: 'read',
          title: bi('GCD with Euclid', 'ƯCLN bằng thuật toán Euclid'),
          text: bi(
            'The greatest common divisor (GCD) of a and b: while b is not 0, replace (a, b) with (b, a % b). When b is 0, a is the answer.',
            'Ước chung lớn nhất (ƯCLN) của a và b: khi b khác 0, thay (a, b) bằng (b, a % b). Khi b bằng 0, a là đáp án.',
          ),
          code: 'a, b = 48, 18\nwhile b != 0:\n    a, b = b, a % b\nprint(a)',
          output: '6',
        },
        {
          kind: 'write',
          task: bi(
            'Write gcd(a, b) using Euclid, and print gcd(84, 36) and gcd(17, 5).',
            'Viết hàm gcd(a, b) theo thuật toán Euclid, rồi in gcd(84, 36) và gcd(17, 5).',
          ),
          starter: 'def gcd(a, b):\n    # Euclid here\n\nprint(gcd(84, 36))\nprint(gcd(17, 5))\n',
          expect: '12\n1',
          solution: 'def gcd(a, b):\n    while b != 0:\n        a, b = b, a % b\n    return a\n\nprint(gcd(84, 36))\nprint(gcd(17, 5))',
          hint: bi('while b != 0: a, b = b, a % b. After the loop, return a.', 'while b != 0: a, b = b, a % b. Sau vòng lặp, return a.'),
        },
      ],
    },
  ],
};
