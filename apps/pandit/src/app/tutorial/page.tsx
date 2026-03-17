import { TutorialFlow } from "@/components/tutorial/TutorialFlow";

export default function TutorialPage() {
  return (
    <div
      className="w-full h-screen"
      style={
        {
          "--tw-primary-opacity": "1",
          "--color-primary": "#ec5b13",
        } as React.CSSProperties
      }
    >
      <style>{`
        [data-tutorial] { --primary: #ec5b13; }
      `}</style>
      <div data-tutorial className="w-full h-screen">
        <TutorialFlow />
      </div>
    </div>
  );
}
