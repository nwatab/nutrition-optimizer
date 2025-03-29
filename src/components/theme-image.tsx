import styles from './theme-image.module.css';
import Image, { ImageProps } from 'next/image';

type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
  srcLight: string;
  srcDark: string;
  alt: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, alt, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className={styles.imgLight} alt={alt} />
      <Image {...rest} src={srcDark} className={styles.imgDark} alt={alt} />
    </>
  );
};

export default ThemeImage;
