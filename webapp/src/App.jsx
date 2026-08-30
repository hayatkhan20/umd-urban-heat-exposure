import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ProblemSection from './components/ProblemSection.jsx';
import WorkflowSection from './components/WorkflowSection.jsx';
import ExploreMap from './components/ExploreMap.jsx';
import ResultsSection from './components/ResultsSection.jsx';
import RecommendationsSection from './components/RecommendationsSection.jsx';
import LimitationsSection from './components/LimitationsSection.jsx';
import AboutSection from './components/AboutSection.jsx';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <WorkflowSection />
        <ExploreMap />
        <ResultsSection />
        <RecommendationsSection />
        <LimitationsSection />
        <AboutSection />
      </main>
    </>
  );
}

export default App;
