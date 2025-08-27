import styles from './Note.module.css';

interface Props {
  children: JSX.Element | null;
}

export const Note = ({ children }: Props) => {
  return (
    <small className={styles.note}>
      {children}
    </small>
  );
};
