import {
  Book,
  BookMarked,
  BookOpen,
  Bone,
  Brain,
  Church,
  ClipboardList,
  Dna,
  Dumbbell,
  Egg,
  Eye,
  Fish,
  FlaskConical,
  Landmark,
  Languages,
  Microscope,
  Scale,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  book: Book,
  'book-marked': BookMarked,
  'book-open': BookOpen,
  bone: Bone,
  brain: Brain,
  church: Church,
  'clipboard-list': ClipboardList,
  dna: Dna,
  dumbbell: Dumbbell,
  egg: Egg,
  eye: Eye,
  fish: Fish,
  flask: FlaskConical,
  landmark: Landmark,
  languages: Languages,
  microscope: Microscope,
  scale: Scale,
};

export default function StudySetIcon({
  iconKey,
  size = 18,
}: {
  iconKey?: string | null;
  size?: number;
}) {
  const Icon = (iconKey && ICONS[iconKey]) || BookOpen;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" focusable="false" />;
}
