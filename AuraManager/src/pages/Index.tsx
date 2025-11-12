</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Get started in minutes and have your AI manager working for you today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-6xl font-bold text-accent/10 absolute -top-4 left-0">{item.step}</div>
                <div className="card-urban p-6 pt-12 h-full">
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-32" id="features">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sedimentary-base/10 border border-sedimentary-base/20">
                <Zap className="h-4 w-4 text-sedimentary-dark" />
                <span className="text-sm font-semibold text-sedimentary-dark">Powerful Features</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              From strategy to analytics, AURA gives you the tools professional artists use to build their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-urban p-8 card-hover animate-slide-up group flex flex-col items-center text-center"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-accent/10 border border-accent/30 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground break-words w-full">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed break-words w-full">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-6xl mx-auto mt-32">
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Success Stories</span>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Artists Growing with AURA
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              See how independent artists are leveling up their careers with AI-powered management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="card-urban p-6 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-accent/20 mb-4" />
                <p className="text-foreground/80 mb-6 flex-grow leading-relaxed">
                  {testimonial.content}
                </p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-foreground/60">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-32 text-center space-y-6 card-urban p-12 animate-fade-in border-accent/30 hover:border-accent/50">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to Take Your Music Career to the Next Level?
          </h2>
          <p className="text-lg text-foreground/70">
            Join thousands of independent artists who trust AURA to manage their careers. Get started free - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-base group" onClick={() => navigate("/auth")}>
              Start Your Journey Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/pricing")} className="text-base">
              View Pricing
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
