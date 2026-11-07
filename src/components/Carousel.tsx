import { Swipe } from "@/components/Swipe";

export function Carousel({ children }: { children: React.ReactNode }) {
  return <Swipe label="Проекты" wide="carousel" from="never">{children}</Swipe>;
}
