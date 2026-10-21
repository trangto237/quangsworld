import { useEffect } from 'react';
import { useQuery } from '@atlas/ui';
import { useKid } from './store';
import { LangContext, type LangMode } from './i18n';
import { ProfilePicker } from './screens/ProfilePicker';
import { Placement } from './screens/Placement';
import { Town } from './screens/Town';
import { Quests } from './screens/Quests';
import { Hero } from './screens/Hero';
import { WorldScreen } from './screens/World';
import { Battle } from './screens/Battle';
import { Results } from './screens/Results';
import { Shop } from './screens/Shop';
import { MistakeBook } from './screens/MistakeBook';
import { ErrorToast } from './components/ErrorToast';
import { installGlobalErrorHandlers } from './lib/errors';

installGlobalErrorHandlers();
import { ExamHall } from './screens/ExamHall';
import { Exam } from './screens/Exam';
import { CoachCorner } from './screens/CoachCorner';
import { CodeLab } from './code/CodeLab';
import { Writing } from './screens/Writing';
import { Arcade } from './screens/Arcade';
import { GardenScreen } from './screens/Garden';

export function App() {
  const studentId = useKid((s) => s.studentId);
  const lang = useQuery((r) => (studentId ? r.getKv<LangMode>(`lang:${studentId}`) : undefined) ?? 'help', [studentId]);
  return (
    <LangContext.Provider value={lang}>
      <Screens />
      <ErrorToast />
    </LangContext.Provider>
  );
}

function Screens() {
  const { studentId, screen, go, logout } = useKid();
  const student = useQuery((r) => (studentId ? r.getStudent(studentId) : undefined), [studentId]);

  // Profile removed by a parent while logged in → back to the picker.
  useEffect(() => {
    if (studentId && !student) logout();
  }, [studentId, student, logout]);

  // First run for this kid: the placement "trial" before anything else.
  useEffect(() => {
    if (student && !student.placementDone && screen.name !== 'placement') go({ name: 'placement' });
  }, [student, screen.name, go]);

  if (!studentId || !student || screen.name === 'profiles') return <ProfilePicker />;
  switch (screen.name) {
    case 'placement':
      return <Placement student={student} />;
    case 'world':
      // The Word Garden island is the garden itself.
      if (screen.worldId === 'word-forest') return <GardenScreen student={student} />;
      return <WorldScreen student={student} worldId={screen.worldId} />;
    case 'battle':
      return <Battle key={screen.mission.id} student={student} mission={screen.mission} fromPlan={screen.fromPlan} />;
    case 'results':
      return <Results student={student} result={screen.result} />;
    case 'shop':
      return <Shop student={student} />;
    case 'mistakes':
      return <MistakeBook student={student} />;
    case 'exam-hall':
      return <ExamHall student={student} />;
    case 'coach':
      return <CoachCorner student={student} topic={screen.topic} conceptId={screen.conceptId} />;
    case 'quests':
      return <Quests student={student} />;
    case 'hero':
      return <Hero student={student} />;
    case 'writing':
      return <Writing student={student} />;
    case 'garden':
      return <GardenScreen key={screen.quest?.id ?? 'garden'} student={student} quest={screen.quest} />;
    case 'arcade':
      return <Arcade student={student} />;
    case 'code':
      return <CodeLab student={student} />;
    case 'exam':
      return <Exam key={screen.examId} student={student} examId={screen.examId} />;
    default:
      return <Town student={student} />;
  }
}
