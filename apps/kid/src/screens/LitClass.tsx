import type { StudentProfile } from '@atlas/db';
import { useQuery, useRepo } from '@atlas/ui';
import { useKid } from '../store';
import { TownScreen } from '../town/Shell';
import { CourseView } from '../code/learn/LearnPython';
import { LIT_COURSE } from '../lit/course';

/** Lessons done in Lớp học Ngữ văn (synced). */
export const litDoneKey = (studentId: string) => `lit-class:${studentId}`;
const REWARD = { coins: 20, gems: 0, xp: 25 };

/**
 * Lớp học Ngữ văn: the guided literature course (Ngữ văn 8 & 9) — each lesson explains, works an example
 * together, practises in small steps and ends with a few guided sentences compared with a model answer.
 */
export function LitClass({ student }: { student: StudentProfile }) {
  const go = useKid((s) => s.go);
  const repo = useRepo();
  const done = useQuery((r) => r.getKv<string[]>(litDoneKey(student.id)) ?? [], [student.id]);
  const finish = async (id: string) => {
    if (!done.includes(id)) await repo.setKv(litDoneKey(student.id), [...done, id]);
    await repo.claimOnce(`lit-class-reward:${student.id}:${id}`, student.id, REWARD);
  };
  return (
    <TownScreen student={student} tab={null} back={() => go({ name: 'realm', realmId: 'literature' })} showPowers={false}>
      <CourseView
        units={LIT_COURSE}
        done={done}
        onPassed={(id) => void finish(id)}
        doneId={(lessonId) => lessonId}
        icon="📖"
        title="Lớp học Ngữ văn"
        intro="Ngữ văn 8 & 9 — học từng bước: hiểu kiến thức, cùng làm mẫu, luyện tập nhỏ, rồi tự viết vài câu. Đã xong {n}/{m} bài."
        prose
      />
    </TownScreen>
  );
}
