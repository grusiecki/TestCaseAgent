import { TitleItem } from './TitleItem';

interface TitlesListProps {
  titles: string[];
  onTitleChange: (index: number, newTitle: string) => void;
  onTitleDelete: (index: number) => void;
}

export const TitlesList = ({ titles, onTitleChange, onTitleDelete }: TitlesListProps) => {
  return (
    <div className="space-y-4">
      {titles.map((title, index) => (
        <TitleItem
          key={`${index}-${title}`}
          title={title}
          index={index}
          onChange={(newTitle) => onTitleChange(index, newTitle)}
          onDelete={() => onTitleDelete(index)}
        />
      ))}
    </div>
  );
};
