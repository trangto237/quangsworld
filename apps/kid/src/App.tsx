import { useEffect } from 'react';
import { useQuery } from '@atlas/ui';
import { useKid } from './store';
import { ProfilePicker } from './screens/ProfilePicker';
import { Placement } from './screens/Placement';
import { Hub } from './screens/Hub';
import { WorldScreen } from './screens/World';
import { Battle } from './screens/Battle';
import { Results } from './screens/Results';
import { Shop } from './screens/Shop';
import { MistakeBook } from './screens/MistakeBook';

export function App() {
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
      return <WorldScreen student={student} worldId={screen.worldId} />;
    case 'battle':
      return <Battle key={screen.mission.id} student={student} mission={screen.mission} fromPlan={screen.fromPlan} />;
    case 'results':
      return <Results student={student} result={screen.result} />;
    case 'shop':
      return <Shop student={student} />;
    case 'mistakes':
      return <MistakeBook student={student} />;
    default:
      return <Hub student={student} />;
  }
}
