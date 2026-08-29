import NewsHeader from "@/components/news/NewsHeader";
import NewsFeed from "@/components/news/NewsFeed";

const NewsPage = () => {
  return (
    <div className="min-h-screen bg-black px-4 py-8 md:px-8 max-w-3xl mx-auto">
      <NewsHeader updatedAgo="4m ago" />
      <NewsFeed />
    </div>
  );
};

export default NewsPage;
