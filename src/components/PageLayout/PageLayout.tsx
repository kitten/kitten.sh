import styles from './PageLayout.module.css';

interface Props {
  children: JSX.Element | null;
}

export const PageLayout = ({ children }: Props) => {
  return (
    <main className={styles.page}>
      {children}
    </main>
  );
};
