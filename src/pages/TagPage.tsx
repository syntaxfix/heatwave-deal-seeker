
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featured_image: string;
  category: string;
  read_time: number;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  } | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

const POSTS_PER_PAGE = 6;

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    if (slug) {
      fetchTagAndPosts();
    }
  }, [slug, currentPage]);

  const fetchTagAndPosts = async () => {
    if (!slug) return;

    try {
      // Fetch tag info
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (tagError || !tagData) {
        console.error('Error fetching tag:', tagError);
        setTag(null);
        setLoading(false);
        return;
      }

      setTag(tagData);

      // Get total count of posts for this tag
      const { count } = await supabase
        .from('blog_tags')
        .select('blog_post_id', { count: 'exact', head: true })
        .eq('tag_id', tagData.id);

      setTotalPosts(count || 0);

      // Fetch blog posts for this tag with pagination
      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data: blogTagsData, error: blogTagsError } = await supabase
        .from('blog_tags')
        .select('blog_post_id')
        .eq('tag_id', tagData.id)
        .range(from, to);

      if (blogTagsError) {
        console.error('Error fetching blog tags:', blogTagsError);
        setPosts([]);
        setLoading(false);
        return;
      }

      if (!blogTagsData || blogTagsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = blogTagsData.map(bt => bt.blog_post_id);

      // Fetch the actual blog posts
      const { data: postsData, error: postsError } = await supabase
        .from('blog_posts')
        .select('*')
        .in('id', postIds)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching blog posts:', postsError);
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

      if (authorIds.length === 0) {
        const postsWithoutProfiles = postsData.map(post => ({
          ...post,
          profiles: null
        }));
        setPosts(postsWithoutProfiles);
        setLoading(false);
        return;
      }

      // Get profiles for authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', authorIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of author_id to profile
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
      }

      // Combine posts with profiles
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: post.author_id ? profilesMap.get(post.author_id) || null : null
      }));

      setPosts(postsWithProfiles);
      
      // Set page title
      document.title = `${tagData.name} - Blog Tags - Spark.deals`;
    } catch (error) {
      console.error('Error in fetchTagAndPosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tag not found
            </h1>
            <p className="text-gray-600">
              The tag you're looking for doesn't exist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tag Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Badge variant="default" className="text-lg px-4 py-2">
                {tag.name}
              </Badge>
            </div>
            <p className="text-gray-600">
              {totalPosts} blog post{totalPosts !== 1 ? 's' : ''} tagged with "{tag.name}"
            </p>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600">
                  There are no published blog posts with this tag yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {/* Featured Image */}
                      <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-4">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div>
                        <Badge variant="secondary" className="mb-2">
                          {post.category}
                        </Badge>

                        <Link to={`/blog/${post.slug}`}>
                          <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                        </Link>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.summary}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{post.profiles?.full_name || post.profiles?.username || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.read_time} min read</span>
                          </div>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagPage;
